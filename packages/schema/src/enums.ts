export enum TeamRole {
  Admin = "admin",
  Team = "team",
}

export enum MarkerStyle {
  Pin = "pin",
}

export enum MapStyle {
  Leaflet = "leaflet",
}

export enum MapMode {
  Earth = "earth",
}

export enum ConfigKey {
  ContestName = "contestName",
  TickDuration = "tickDuration",
  IsRunning = "isRunning",
  CurrentTick = "currentTick",
  CurrentRound = "currentRound",
  StartDate = "startDate",
  TickPerRound = "tickPerRound",
  TotalRounds = "totalRounds",
  EndDate = "endDate",
  AttackPoints = "attackPoints",
  DefensePoints = "defensePoints",
  SlaWeight = "slaWeight",
  FirstBloodBonus = "firstBloodBonus",
  CheckerPoolSize = "checkerPoolSize",
  CheckerTimeout = "checkerTimeout",
  FlagTemplate = "flagTemplate",
}

export enum SSEEventType {
  Notification = "notification",
  Activity = "activity",
  Scoreboard = "scoreboard",
  Tick = "tick",
  ServiceStatus = "service_status",
  ConfigChange = "config_change",
  Log = "log",
  Ping = "ping",
  Connected = "connected",
}
