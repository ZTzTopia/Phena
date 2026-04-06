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
  ContestName = "contest_name",
  TickDuration = "tick_duration",
  IsRunning = "is_running",
  CurrentTick = "current_tick",
  CurrentRound = "current_round",
  StartDate = "start_date",
  TickPerRound = "tick_per_round",
  TotalRounds = "total_rounds",
  FlagTemplate = "flag_template",
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
