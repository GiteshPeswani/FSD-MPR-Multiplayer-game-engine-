export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const shortenText = (text, length = 100) => {
  return text.length > length ? text.substring(0, length) + '...' : text;
};
