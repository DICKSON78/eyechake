const getStatusLabel = (result, status, target = 0) => {
  if (result === 0 || result === "0") return "No count";
  if (status === "default" && target === 0) return "Please set target";
  let percentage = 0;
  if (typeof result === "string" && result.includes("%")) {
    percentage = parseInt(result.replace("%", ""));
  } else if (typeof result === "number") {
    percentage = result;
  }
  if (percentage >= 75) return "Above";
  else if (percentage >= 50) return "Average";
  else return "Below";
};
