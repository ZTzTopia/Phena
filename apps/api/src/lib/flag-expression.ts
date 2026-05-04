export interface FlagContext {
  challengeId: number;
  teamId: number;
  serviceId: number;
  round: number;
  tick: number;
  index: number;
}

export type ParsedExpression =
  | { type: "literal"; value: string }
  | { type: "expression"; name: string; args?: string[] };

export interface ValidateResult {
  valid: boolean;
  errors: string[];
}

const VALID_EXPRESSIONS = new Set([
  "challengeId",
  "teamId",
  "serviceId",
  "round",
  "tick",
  "index",
  "uuid",
  "date",
  "timestamp",
  "md5",
  "sha256",
]);

export function parseTemplate(template: string): ParsedExpression[] {
  const result: ParsedExpression[] = [];
  let lastIndex = 0;
  let i = 0;

  while (i < template.length) {
    if (template[i] === "{" && template[i + 1] === "{") {
      if (i > lastIndex) {
        result.push({ type: "literal", value: template.slice(lastIndex, i) });
      }

      const closeIdx = template.indexOf("}}", i + 2);
      if (closeIdx === -1) {
        result.push({ type: "literal", value: template.slice(i) });
        break;
      }

      const inner = template.slice(i + 2, closeIdx);
      if (inner.length === 0) {
        result.push({ type: "literal", value: "{{" });
        i += 2;
        lastIndex = i;
        continue;
      }

      if (inner.startsWith("{")) {
        result.push({ type: "literal", value: "{" });
        result.push({ type: "expression", name: inner.slice(1) });
      } else {
        result.push({ type: "expression", name: inner });
      }

      i = closeIdx + 2;
      lastIndex = i;
    } else {
      i++;
    }
  }

  if (lastIndex < template.length) {
    result.push({ type: "literal", value: template.slice(lastIndex) });
  }

  return result;
}

export function validateTemplate(template: string): ValidateResult {
  const errors: string[] = [];
  let i = 0;

  while (i < template.length) {
    if (template[i] === "{" && template[i + 1] === "{") {
      const closeIdx = template.indexOf("}}", i + 2);
      if (closeIdx === -1) {
        errors.push(`Unclosed expression at position ${i}`);
        break;
      }

      const inner = template.slice(i + 2, closeIdx);
      if (inner.length === 0) {
        errors.push(`Empty expression at position ${i}`);
        i += 2;
        continue;
      }

      if (inner.startsWith("{")) {
        const exprName = inner.slice(1);
        if (exprName) {
          if (exprName.startsWith("random[")) {
            const endIdx = exprName.indexOf("]");
            if (endIdx === -1) {
              errors.push(`random[N] missing closing bracket`);
            } else {
              const num = parseInt(exprName.slice(7, endIdx), 10);
              if (isNaN(num) || num < 1 || num > 128) {
                errors.push(
                  `random[N] requires N between 1 and 128, got ${exprName.slice(7, endIdx)}`,
                );
              }
            }
          } else if (!VALID_EXPRESSIONS.has(exprName)) {
            errors.push(`Unknown expression: ${exprName}`);
          }
        } else {
          errors.push(`Empty expression at position ${i}`);
        }

        i = closeIdx + 2;
        continue;
      }

      const isRandom = inner.startsWith("random[");
      if (isRandom) {
        const endIdx = inner.indexOf("]");
        if (endIdx === -1) {
          errors.push(`random[N] missing closing bracket`);
        } else {
          const num = parseInt(inner.slice(7, endIdx), 10);
          if (isNaN(num) || num < 1 || num > 128) {
            errors.push(`random[N] requires N between 1 and 128, got ${inner.slice(7, endIdx)}`);
          }
        }
      } else if (!VALID_EXPRESSIONS.has(inner)) {
        errors.push(`Unknown expression: ${inner}`);
      }

      i = closeIdx + 2;
    } else {
      i++;
    }
  }

  return { valid: errors.length === 0, errors };
}

export function evaluateExpression(expr: string, ctx: FlagContext): string | Error {
  if (expr.startsWith("random[")) {
    const endIndex = expr.indexOf("]");
    if (endIndex === -1) {
      return new Error(`random[N] requires closing bracket`);
    }

    const inner = expr.slice(7, endIndex);
    const length = parseInt(inner, 10);
    if (isNaN(length) || length < 1 || length > 128) {
      return new Error(`random[N] requires N between 1 and 128`);
    }

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars[randomValues[i]! % chars.length]!;
    }

    return result;
  }

  switch (expr) {
    case "challengeId":
      return ctx.challengeId.toString();
    case "teamId":
      return ctx.teamId.toString();
    case "serviceId":
      return ctx.serviceId.toString();
    case "round":
      return ctx.round.toString();
    case "tick":
      return ctx.tick.toString();
    case "index":
      return ctx.index.toString();
    case "uuid":
      return crypto.randomUUID();
    case "date": {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }
    case "timestamp":
      return Math.floor(Date.now() / 1000).toString();
    case "md5":
    case "sha256": {
      const bytes = crypto.getRandomValues(new Uint8Array(expr === "md5" ? 16 : 32));
      if (typeof Bun !== "undefined" && Bun.CryptoHasher) {
        const hasher = new Bun.CryptoHasher(expr === "md5" ? "md5" : "sha256");
        hasher.update(bytes);
        return hasher.digest("hex");
      }
      return new Error(`${expr} hash requires Bun runtime`);
    }
    default:
      return new Error(`Unknown expression: ${expr}`);
  }
}

export function evaluateTemplate(template: string, ctx: FlagContext): string | Error {
  const parsed = parseTemplate(template);
  let result = "";

  for (const item of parsed) {
    if (item.type === "literal") {
      result += item.value;
    } else {
      const value = evaluateExpression(item.name, ctx);
      if (value instanceof Error) {
        return value;
      }

      result += value;
    }
  }

  return result;
}

export const DEFAULT_FLAG_TEMPLATE = "PHENA{{{uuid}}}";
