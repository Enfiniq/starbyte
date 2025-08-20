import { formatDistanceToNow } from "date-fns";

export const dateFromNow = (dateString: string) => {
  try {
    const date = new Date(dateString) || Date.now();
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error: unknown) {
    return null;
  }
};
