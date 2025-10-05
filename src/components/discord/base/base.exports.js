function FormatTimeEx(milliseconds) {
  const seconds = milliseconds / 1000;
  
  if (seconds < 60) {
    return `${seconds.toFixed(1)} segundo${seconds !== 1 ? 's' : ''}`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const secondsRemaining = seconds % 60;
  
  if (minutes < 60) {
    if (secondsRemaining === 0) {
      return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    }
    return `${minutes} minuto${minutes !== 1 ? 's' : ''} e ${secondsRemaining.toFixed(0)} segundo${secondsRemaining !== 1 ? 's' : ''}`;
  }
  const hours = Math.floor(minutes / 60);
  const minutesRemaining  = minutes % 60;
  
  return `${hours} hora${hours !== 1 ? 's' : ''}, ${minutesRemaining} minuto${minutesRemaining !== 1 ? 's' : ''} e ${secondsRemaining.toFixed(0)} segundo${secondsRemaining !== 1 ? 's' : ''}`;
}

module.exports = { FormatTimeEx };