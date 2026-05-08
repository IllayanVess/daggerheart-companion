export type ClassOption = {
  class_name: string;
  subclass1_name: string | null;
  subclass1_description: string | null;
  subclass2_name: string | null;
  subclass2_description: string | null;
};

export type ClassDetail = {
  class_name: string;
  domains: string[];
  starting_evasion: number;
  starting_hit_points: number;
  class_items: string[];
  hope_feature: string;
  class_feature: string;
  subclass_names: string[];
};

export type SubclassDetail = {
  subclass_name: string;
  class_name: string;
  spellcast_trait: number | null;
  spellcast_trait_type: string | null;
  foundation_feature: string;
  specialization_feature: string | null;
  mastery_feature: string | null;
};

export type AncestryOption = {
  ancestry_name: string;
  ancestry_feature1: string | null;
  ancestry_feature2: string | null;
};

export type CommunityOption = {
  community_name: string;
  community_feature: string | null;
};

export type DomainCardOption = {
  card_name: string;
  domain_name: string;
  card_level: number;
  card_type: string;
  recall_cost: number | null;
  card_text: string;
  source_url: string | null;
};

export type EquipmentOption = {
  item_name: string;
  category: string;
  subcategory: string | null;
  tier: number | null;
  trait_name: string | null;
  range_name: string | null;
  damage_text: string | null;
  damage_type: string | null;
  burden: string | null;
  thresholds_major: number | null;
  thresholds_severe: number | null;
  base_score: number | null;
  feature_text: string | null;
  description_text: string;
  source_url: string | null;
};
