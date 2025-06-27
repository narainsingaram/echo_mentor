"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

// Dummy chart data for demonstration
const chartData = [
  { date: "2025-03-20", desktop: 120, mobile: 180 },
  { date: "2025-03-21", desktop: 150, mobile: 200 },
  { date: "2025-03-22", desktop: 130, mobile: 190 },
  { date: "2025-03-23", desktop: 170, mobile: 220 },
  { date: "2025-03-24", desktop: 140, mobile: 195 },
  { date: "2025-03-25", desktop: 160, mobile: 210 },
  { date: "2025-03-26", desktop: 180, mobile: 230 },
  { date: "2025-03-27", desktop: 190, mobile: 240 },
  { date: "2025-03-28", desktop: 175, mobile: 225 },
  { date: "2025-03-29", desktop: 200, mobile: 250 },
  { date: "2025-03-30", desktop: 210, mobile: 260 },
  { date: "2025-03-31", desktop: 220, mobile: 270 },
  { date: "2025-04-01", desktop: 230, mobile: 280 },
  { date: "2025-04-02", desktop: 200, mobile: 250 },
  { date: "2025-04-03", desktop: 210, mobile: 260 },
  { date: "2025-04-04", desktop: 220, mobile: 270 },
  { date: "2025-04-05", desktop: 230, mobile: 280 },
  { date: "2025-04-06", desktop: 240, mobile: 290 },
  { date: "2025-04-07", desktop: 250, mobile: 300 },
  { date: "2025-04-08", desktop: 260, mobile: 310 },
  { date: "2025-04-09", desktop: 270, mobile: 320 },
  { date: "2025-04-10", desktop: 280, mobile: 330 },
  { date: "2025-04-11", desktop: 290, mobile: 340 },
  { date: "2025-04-12", desktop: 300, mobile: 350 },
  { date: "2025-04-13", desktop: 310, mobile: 360 },
  { date: "2025-04-14", desktop: 320, mobile: 370 },
  { date: "2025-04-15", desktop: 330, mobile: 380 },
  { date: "2025-04-16", desktop: 340, mobile: 390 },
  { date: "2025-04-17", desktop: 350, mobile: 400 },
  { date: "2025-04-18", desktop: 360, mobile: 410 },
  { date: "2025-04-19", desktop: 370, mobile: 420 },
  { date: "2025-04-20", desktop: 380, mobile: 430 },
  { date: "2025-04-21", desktop: 390, mobile: 440 },
  { date: "2025-04-22", desktop: 400, mobile: 450 },
  { date: "2025-04-23", desktop: 410, mobile: 460 },
  { date: "2025-04-24", desktop: 420, mobile: 470 },
  { date: "2025-04-25", desktop: 430, mobile: 480 },
  { date: "2025-04-26", desktop: 440, mobile: 490 },
  { date: "2025-04-27", desktop: 450, mobile: 500 },
  { date: "2025-04-28", desktop: 460, mobile: 510 },
  { date: "2025-04-29", desktop: 470, mobile: 520 },
  { date: "2025-04-30", desktop: 480, mobile: 530 },
  { date: "2025-05-01", desktop: 490, mobile: 540 },
  { date: "2025-05-02", desktop: 500, mobile: 550 },
  { date: "2025-05-03", desktop: 490, mobile: 540 },
  { date: "2025-05-04", desktop: 480, mobile: 530 },
  { date: "2025-05-05", desktop: 470, mobile: 520 },
  { date: "2025-05-06", desktop: 460, mobile: 510 },
  { date: "2025-05-07", desktop: 450, mobile: 500 },
  { date: "2025-05-08", desktop: 440, mobile: 490 },
  { date: "2025-05-09", desktop: 430, mobile: 480 },
  { date: "2025-05-10", desktop: 420, mobile: 470 },
  { date: "2025-05-11", desktop: 410, mobile: 460 },
  { date: "2025-05-12", desktop: 400, mobile: 450 },
  { date: "2025-05-13", desktop: 390, mobile: 440 },
  { date: "2025-05-14", desktop: 380, mobile: 430 },
  { date: "2025-05-15", desktop: 370, mobile: 420 },
  { date: "2025-05-16", desktop: 360, mobile: 410 },
  { date: "2025-05-17", desktop: 350, mobile: 400 },
  { date: "2025-05-18", desktop: 340, mobile: 390 },
  { date: "2025-05-19", desktop: 330, mobile: 380 },
  { date: "2025-05-20", desktop: 320, mobile: 370 },
  { date: "2025-05-21", desktop: 310, mobile: 360 },
  { date: "2025-05-22", desktop: 300, mobile: 350 },
  { date: "2025-05-23", desktop: 290, mobile: 340 },
  { date: "2025-05-24", desktop: 280, mobile: 330 },
  { date: "2025-05-25", desktop: 270, mobile: 320 },
  { date: "2025-05-26", desktop: 260, mobile: 310 },
  { date: "2025-05-27", desktop: 250, mobile: 300 },
  { date: "2025-05-28", desktop: 240, mobile: 290 },
  { date: "2025-05-29", desktop: 230, mobile: 280 },
  { date: "2025-05-30", desktop: 220, mobile: 270 },
  { date: "2025-05-31", desktop: 210, mobile: 260 },
  { date: "2025-06-01", desktop: 200, mobile: 250 },
  { date: "2025-06-02", desktop: 190, mobile: 240 },
  { date: "2025-06-03", desktop: 180, mobile: 230 },
  { date: "2025-06-04", desktop: 170, mobile: 220 },
  { date: "2025-06-05", desktop: 160, mobile: 210 },
  { date: "2025-06-06", desktop: 150, mobile: 200 },
  { date: "2025-06-07", desktop: 140, mobile: 190 },
  { date: "2025-06-08", desktop: 130, mobile: 180 },
  { date: "2025-06-09", desktop: 120, mobile: 170 },
  { date: "2025-06-10", desktop: 110, mobile: 160 },
  { date: "2025-06-11", desktop: 100, mobile: 150 },
  { date: "2025-06-12", desktop: 90, mobile: 140 },
  { date: "2025-06-13", desktop: 80, mobile: 130 },
  { date: "2025-06-14", desktop: 70, mobile: 120 },
  { date: "2025-06-15", desktop: 60, mobile: 110 },
  { date: "2025-06-16", desktop: 50, mobile: 100 },
  { date: "2025-06-17", desktop: 40, mobile: 90 },
  { date: "2025-06-18", desktop: 30, mobile: 80 },
  { date: "2025-06-19", desktop: 20, mobile: 70 },
  { date: "2025-06-20", desktop: 10, mobile: 60 },
  { date: "2025-06-21", desktop: 5, mobile: 55 },
  { date: "2025-06-22", desktop: 15, mobile: 65 },
  { date: "2025-06-23", desktop: 25, mobile: 75 },
  { date: "2025-06-24", desktop: 35, mobile: 85 },
  { date: "2025-06-25", desktop: 45, mobile: 95 },
  { date: "2025-06-26", desktop: 55, mobile: 105 },
  { date: "2025-06-27", desktop: 65, mobile: 115 }, // Current date
]

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("3m") // Default: 3 months

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date() // Use the current date as the reference
    let daysToSubtract = 90 // default: 3 months

    switch (timeRange) {
      case "1d":
        daysToSubtract = 1
        break
      case "7d":
        daysToSubtract = 7
        break
      case "1m":
        daysToSubtract = 30
        break
      case "3m":
        daysToSubtract = 90
        break
    }

    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>📈 Avg. Rating Trend</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total for the selected timeframe
          </span>
          <span className="@[540px]/card:hidden">Selected timeframe</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="1d">1 Day</ToggleGroupItem>
            <ToggleGroupItem value="7d">7 Days</ToggleGroupItem>
            <ToggleGroupItem value="1m">1 Month</ToggleGroupItem>
            <ToggleGroupItem value="3m">3 Months</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="1d" className="rounded-lg">1 Day</SelectItem>
              <SelectItem value="7d" className="rounded-lg">7 Days</SelectItem>
              <SelectItem value="1m" className="rounded-lg">1 Month</SelectItem>
              <SelectItem value="3m" className="rounded-lg">3 Months</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-mobile)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-mobile)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="mobile"
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-mobile)"
              stackId="a"
            />
            <Area
              dataKey="desktop"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-desktop)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}