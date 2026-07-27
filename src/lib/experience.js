const BRANDS = {
  kid: { name: "Level Up Kids", ageLabel: "6–11 tuổi" },
  teen: { name: "Level Up Teens", ageLabel: "12+ tuổi" },
};

export function getExperienceBrand(uiMode) {
  return BRANDS[uiMode] || BRANDS.kid;
}
