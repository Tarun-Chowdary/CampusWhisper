export const calculateMatchScore = (currentUser, otherUser, matchMode) => {
  let score = 0;

  const a = currentUser.matchmaking;
  const b = otherUser.matchmaking;

  /* ---------- Opposite gender (HIGH priority) ---------- */
  if (a.gender && b.gender && a.gender !== b.gender) {
    score += 40; // strong priority
  }

  /* ---------- Same college ONLY if mode = same-college ---------- */
  if (
    matchMode === "same-college" &&
    a.college &&
    b.college &&
    a.college === b.college
  ) {
    score += 50; // highest boost
  }

  /* ---------- Shared interests ---------- */
  const commonInterests =
    a.interests?.filter((i) => b.interests?.includes(i)) || [];
  score += commonInterests.length * 10;

  /* ---------- Shared preferences ---------- */
  const commonPrefs =
    a.preferences?.filter((p) => b.preferences?.includes(p)) || [];
  score += commonPrefs.length * 5;

  return score;
};
