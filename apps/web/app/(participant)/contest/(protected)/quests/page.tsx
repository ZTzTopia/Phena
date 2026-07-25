"use client";

import { Button } from "@phena/ui/components/8bit/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@phena/ui/components/8bit/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@phena/ui/components/8bit/dialog";
import { Input } from "@phena/ui/components/8bit/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@phena/ui/components/8bit/tooltip";
import { useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";
import { Redo, Reload, Search, Square } from "pixelarticons/react";
import { useEffect, useState } from "react";
import Loading from "@/app/(participant)/loading";
import { useAuth } from "@/app/auth-provider";
import { client } from "@/lib/api-client";

export default function ChallengesPage() {
  const { team } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data } = useQuery({
    queryKey: ["contest", "challenges", { page: 1, limit: 100, search: debouncedSearch }],
    queryFn: async () =>
      parseResponse(
        client.api.challenges.$get({
          query: { page: "1", limit: "100", search: debouncedSearch },
        }),
      ),
    placeholderData: (previousData) => previousData,
  });

  const challenges = data?.challenges ?? [];

  if (!team) {
    return <Loading />;
  }

  if (!challenges) {
    return <div></div>;
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="mb-8 text-center">
        <h2 className="retro mb-3 text-2xl font-bold tracking-tight md:text-3xl">Quests</h2>
        <p className="retro text-muted-foreground text-[9px]">Description.</p>
      </div>

      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search quests..."
          className="w-full pl-10"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <div className="flex flex-row items-center gap-4">
        <Input placeholder="Submit flags" className="w-full" />
        <Button className="w-fit">Submit</Button>
      </div>

      <div className="grid h-fit w-full gap-x-6 gap-y-3 md:grid-cols-2">
        {challenges.map((item) => (
          <Dialog key={item.title}>
            <DialogTrigger asChild>
              <Card className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="retro text-xs">{item.title}</CardTitle>
                    {/*<Badge
                      variant={
                        item.service.status === "pending"
                          ? "secondary"
                          : item.service.status === "failed"
                            ? "destructive"
                            : "default"
                      }
                    >
                      {item.service.status}
                    </Badge>*/}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-3 text-[10px] leading-relaxed">
                    {item.description.slice(0, 64)}
                  </CardDescription>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="min-w-2xl">
              <DialogHeader>
                <DialogTitle>{item.title}</DialogTitle>
                <DialogDescription>{item.description}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                {/*<Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost">
                      <Play />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>Start Machine</span>
                  </TooltipContent>
                </Tooltip>*/}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost">
                      <Square />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>Stop Machine</span>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost">
                      <Redo />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>Restart Machine</span>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost">
                      <Reload />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>Reset Machine</span>
                  </TooltipContent>
                </Tooltip>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
}
