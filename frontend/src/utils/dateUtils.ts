export const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric' 
  });
};

export const formatTripDuration = (tripDays: Array<{ date: Date; dayNumber: number }>) => {
  if (tripDays.length > 0) {
    const start = tripDays[0].date;
    const end = tripDays[tripDays.length - 1].date;
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
  return '';
};

export const generateTripDays = (startDate: Date, endDate: Date) => {
  const days: Array<{ date: Date; dayNumber: number }> = [];
  let currentDate = new Date(startDate);
  let dayNumber = 1;

  while (currentDate <= endDate) {
    days.push({
      date: new Date(currentDate),
      dayNumber: dayNumber
    });
    currentDate.setDate(currentDate.getDate() + 1);
    dayNumber++;
  }

  return days;
};
