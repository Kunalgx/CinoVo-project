export const REGION_STORAGE_KEY = "cinevo-region";
export const DEFAULT_REGION = "US";

export const getRegion = () =>
  localStorage.getItem(REGION_STORAGE_KEY) || DEFAULT_REGION;

export const setRegion = (region) => {
  localStorage.setItem(REGION_STORAGE_KEY, region);
  window.dispatchEvent(new CustomEvent("cinevo-region-change", { detail: region }));
};
