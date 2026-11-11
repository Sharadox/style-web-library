import type { StyleGroupData } from "@sharadox/style-web-library/apply/type";

export interface StyleKeeperProperties {
  /** The style groups, from `styleApplyData(configuration)`. */
  groups: StyleGroupData[];
}
