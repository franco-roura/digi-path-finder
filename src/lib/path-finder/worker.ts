import { findPath } from "./index";

self.onmessage = function (e) {
  const result = findPath(
    e.data.originDigimon,
    e.data.targetDigimon,
    e.data.skills
  );
  self.postMessage(result);
};
