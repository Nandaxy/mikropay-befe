import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent
} from "@/components/ui/chart";
import Sidebar from "./admin/sidebar.jsx";

export const description = "An interactive bar chart";

const chartData = [
    { date: "2024-04-01", desktop: 222, mobile: 150 },
    { date: "2024-04-02", desktop: 97, mobile: 180 },
    { date: "2024-04-03", desktop: 167, mobile: 120 },
    { date: "2024-04-04", desktop: 242, mobile: 260 },
    { date: "2024-04-05", desktop: 373, mobile: 90 },
    { date: "2024-04-06", desktop: 373, mobile: 670 }
    // ... (rest of your chart data)
];

const chartConfig = {
    views: {
        label: "Page Views"
    },
    desktop: {
        label: "Desktop",
        color: "hsl(var(--chart-1))"
    },
    mobile: {
        label: "Mobile",
        color: "hsl(var(--chart-2))"
    }
}; // Ensure you have the semicolon here

export function BarChartComponent() {
    const [activeChart, setActiveChart] = React.useState("desktop"); // Changed here

    const total = React.useMemo(
        () => ({
            desktop: chartData.reduce((acc, curr) => acc + curr.desktop, 0),
            mobile: chartData.reduce((acc, curr) => acc + curr.mobile, 0)
        }),
        []
    );

    return (
        <Card>
            <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                    <CardTitle>Bar Chart - Interactive</CardTitle>
                    <CardDescription>
                        Showing total visitors for the last 3 months
                    </CardDescription>
                </div>
                <div className="flex">
                    {["desktop", "mobile"].map(key => {
                        return (
                            <button
                                key={key}
                                data-active={activeChart === key}
                                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                                onClick={() => setActiveChart(key)}
                            >
                                <span className="text-xs text-muted-foreground">
                                    {chartConfig[key].label}
                                </span>
                                <span className="text-lg font-bold leading-none sm:text-3xl">
                                    {total[key].toLocaleString()}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={value => {
                                const date = new Date(value);
                                return date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric"
                                });
                            }}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[150px]"
                                    nameKey="views"
                                    labelFormatter={value => {
                                        return new Date(
                                            value
                                        ).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric"
                                        });
                                    }}
                                />
                            }
                        />
                        <Bar
                            dataKey={activeChart}
                            fill={`var(--color-${activeChart})`}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

const Dashboard = ({ user }) => {
    console.log(user);

    return (
        <div>
            <Sidebar user={user}>
                <div className="p-4">
                    <BarChartComponent />
                </div>
            </Sidebar>
        </div>
    );
};

export default Dashboard;
