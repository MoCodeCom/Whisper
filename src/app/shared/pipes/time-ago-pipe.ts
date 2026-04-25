import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "timeAgo" })
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | Date | null): string {
    if (!value) return "—";
    const d       = new Date(value);
    const now     = new Date();
    const diffMs  = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1)  return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH  < 24)  return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    if (diffD === 1)  return "yesterday";
    if (diffD < 7)    return `${diffD} days ago`;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }
}
