export const convertToLocalTimeString = (timestamp: string): string => {
  const utcDate = new Date(timestamp);
  if (isNaN(utcDate.getTime())) {
    throw new Error("Invalid timestamp");
  }

  const timezoneOffset = utcDate.getTimezoneOffset() * 60000;
  const localDate = new Date(utcDate.getTime() - timezoneOffset);

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  return localDate.toLocaleTimeString(undefined, timeOptions);
};

export const convertToLocalDateString = (timestamp: string): string => {
  const utcDate = new Date(timestamp);
  if (isNaN(utcDate.getTime())) {
    throw new Error("Invalid timestamp");
  }

  const timezoneOffset = utcDate.getTimezoneOffset() * 60000;
  const localDate = new Date(utcDate.getTime() - timezoneOffset);

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  return localDate.toLocaleDateString(undefined, dateOptions);
};
