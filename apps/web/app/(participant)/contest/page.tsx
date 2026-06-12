"use client";

import { Badge } from "@phena/ui/components/8bit/badge";
import PlayerProfileCard from "@phena/ui/components/8bit/blocks/player-profile-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@phena/ui/components/8bit/card";
import { ChartContainer, ChartTooltipContent } from "@phena/ui/components/8bit/chart";
import { Progress } from "@phena/ui/components/8bit/progress";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import Loading from "@/app/(participant)/loading";
import { useAuth } from "@/app/auth-provider";

const mockActivityData = [
  { time: "00:00", score: 120 },
  { time: "04:00", score: 280 },
  { time: "08:00", score: 450 },
  { time: "12:00", score: 720 },
  { time: "16:00", score: 1100 },
  { time: "20:00", score: 850 },
];

const chartConfig = {
  score: {
    label: "Score",
    color: "#22c55e",
  },
};

const mockStats = {
  health: { current: 85, max: 100 },
  mana: { current: 60, max: 100 },
  experience: { current: 3500, max: 5000 },
};

export default function MissionCenterPage() {
  const { team, isLoading: isAuthLoading } = useAuth();

  if (isAuthLoading || !team) {
    return <Loading />;
  }

  return (
    <section className="w-full px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col">
          <div>
            <PlayerProfileCard
              playerName={team.name}
              level={12}
              stats={mockStats}
              playerClass="CTF Challenger"
              className="retro max-w-full"
            />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="retro">
                <CardHeader className="pb-2">
                  <CardDescription className="retro text-[9px] md:text-[10px]">
                    TOTAL SCORE
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="retro text-2xl font-bold md:text-3xl">8,500</span>
                    <Badge className="retro text-[9px]">+1,200</Badge>
                  </div>
                  <Progress
                    value={85}
                    variant="retro"
                    progressBg="bg-green-500"
                    className="mt-3 h-2"
                  />
                </CardContent>
              </Card>

              <Card className="retro">
                <CardHeader className="pb-2">
                  <CardDescription className="retro text-[9px] md:text-[10px]">
                    CHALLENGES SOLVED
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="retro text-2xl font-bold md:text-3xl">24</span>
                    <Badge variant="secondary" className="retro text-[9px]">
                      3 PENDING
                    </Badge>
                  </div>
                  <Progress
                    value={80}
                    variant="retro"
                    progressBg="bg-blue-500"
                    className="mt-3 h-2"
                  />
                </CardContent>
              </Card>

              <Card className="retro">
                <CardHeader className="pb-2">
                  <CardDescription className="retro text-[9px] md:text-[10px]">
                    RANK
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="retro text-2xl font-bold md:text-3xl">#1</span>
                    <Badge className="retro text-[9px]">TOP 5%</Badge>
                  </div>
                  <p className="retro text-muted-foreground mt-2 text-[9px]">
                    2nd place is 700 pts behind
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="retro mt-6">
              <CardHeader>
                <CardTitle className="retro text-sm md:text-base">ACTIVITY TIMELINE</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-72 w-full">
                  <AreaChart data={mockActivityData}>
                    <CartesianGrid strokeDasharray="4 4" className="stroke-border/50" />
                    <XAxis
                      dataKey="time"
                      className="retro text-[9px]"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis className="retro text-[9px]" tickLine={false} axisLine={false} />
                    <ChartTooltipContent
                      className="retro"
                      formatter={(value: unknown) => `${value} Score`}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#22c55e"
                      fill="#22c55e"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
