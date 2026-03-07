import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
    title: string;
    value: string;
    trend?: string;
    trendUp?: boolean;
    icon: LucideIcon;
    description?: string;
}

export function MetricCard({
    title,
    value,
    trend,
    trendUp,
    icon: Icon,
    description,
}: MetricCardProps) {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{title}</h3>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="pt-4">
                <div className="text-2xl font-bold">{value}</div>
                {(trend || description) && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {trend && (
                            <span className={cn("font-medium", trendUp ? "text-green-600" : "text-red-600")}>
                                {trend}
                            </span>
                        )}{" "}
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}
