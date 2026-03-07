import { cn } from "@/lib/utils";

interface InfiniteMarqueeProps {
    children: React.ReactNode;
    direction?: "left" | "right";
    speed?: "fast" | "normal" | "slow";
    className?: string;
}

export function InfiniteMarquee({
    children,
    direction = "left",
    speed = "normal",
    className,
}: InfiniteMarqueeProps) {
    const speedClass = {
        fast: "duration-[20s]",
        normal: "duration-[40s]",
        slow: "duration-[60s]",
    };

    return (
        <div className={cn("group flex overflow-hidden p-2", className)}>
            <div
                className={cn(
                    "flex min-w-full shrink-0 items-center justify-around gap-8",
                    direction === "left" ? "animate-scroll" : "animate-scroll-reverse",
                    speed === "normal" && "animate-[scroll_40s_linear_infinite]" // Fallback/Force
                )}
            >
                {children}
            </div>
            <div
                aria-hidden="true"
                className={cn(
                    "flex min-w-full shrink-0 items-center justify-around gap-8",
                    direction === "left" ? "animate-scroll" : "animate-scroll-reverse",
                    speed === "normal" && "animate-[scroll_40s_linear_infinite]"
                )}
            >
                {children}
            </div>
        </div>
    );
}
