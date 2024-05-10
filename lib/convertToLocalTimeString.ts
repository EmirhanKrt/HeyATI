export const convertToLocalTimeString: (timestamp: string) => string = (
  timestamp
) => {
  const date = new Date(timestamp);

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  const formattedTime = date.toLocaleTimeString("en-US", timeOptions);

  return `${formattedTime}`;
};

export const convertToLocalDateString: (timestamp: string) => string = (
  timestamp
) => {
  const date = new Date(timestamp);

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  const formattedDate = date.toLocaleDateString("en-US", dateOptions);

  return `${formattedDate}`;
};
