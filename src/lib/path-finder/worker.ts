import { findPath } from "./index";

self.onmessage = function (e) {
  const result = findPath(
    e.data.originDigimon,
    e.data.targetDigimon,
    e.data.skills,
    e.data.excludedDigimonIds,
    e.data.initialAbi,
    e.data.initialLevel
  );
  self.postMessage(result);
};
