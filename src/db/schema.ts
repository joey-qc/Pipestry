import { sql } from "drizzle-orm";
import {
  boolean,
  char,
  check,
  index,
  integer,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

const generatedId = () =>
  integer("id").primaryKey().generatedByDefaultAsIdentity();

const lookupDescription = (name = "description") => text(name).notNull();

export const countries = pgTable("countries", {
  alpha2: char("alpha2", { length: 2 }).primaryKey(),
  name: text("name").notNull(),
  alpha3: char("alpha3", { length: 3 }),
});

export const pipeManufacturers = pgTable(
  "pipe_manufacturers",
  {
    id: generatedId(),
    name: text("name").notNull(),
    countryCode: char("country_code", { length: 2 }).references(
      () => countries.alpha2,
      { onDelete: "restrict" },
    ),
    url: text("url"),
  },
  (table) => [unique("pipe_manufacturers_name_unique").on(table.name)],
);

export const pipeShapes = pgTable(
  "pipe_shapes",
  {
    id: generatedId(),
    description: lookupDescription(),
  },
  (table) => [unique("pipe_shapes_description_unique").on(table.description)],
);

export const pipeMaterials = pgTable(
  "pipe_materials",
  {
    id: generatedId(),
    description: lookupDescription(),
  },
  (table) => [
    unique("pipe_materials_description_unique").on(table.description),
  ],
);

export const stemMaterials = pgTable(
  "stem_materials",
  {
    id: generatedId(),
    description: lookupDescription(),
  },
  (table) => [
    unique("stem_materials_description_unique").on(table.description),
  ],
);

export const pipeFinishes = pgTable(
  "pipe_finishes",
  {
    id: generatedId(),
    description: lookupDescription(),
  },
  (table) => [unique("pipe_finishes_description_unique").on(table.description)],
);

export const pipeFilters = pgTable(
  "pipe_filters",
  {
    id: generatedId(),
    description: lookupDescription(),
  },
  (table) => [unique("pipe_filters_description_unique").on(table.description)],
);

export const pipeStatuses = pgTable(
  "pipe_statuses",
  {
    id: integer("id").primaryKey(),
    description: lookupDescription(),
  },
  (table) => [unique("pipe_statuses_description_unique").on(table.description)],
);

export const maintenanceActions = pgTable(
  "maintenance_actions",
  {
    id: integer("id").primaryKey(),
    description: lookupDescription(),
  },
  (table) => [
    unique("maintenance_actions_description_unique").on(table.description),
  ],
);

export const pipes = pgTable(
  "pipes",
  {
    id: generatedId(),
    manufacturerId: integer("manufacturer_id")
      .notNull()
      .references(() => pipeManufacturers.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    acquiredAt: timestamp("acquired_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
    shapeId: integer("shape_id")
      .notNull()
      .references(() => pipeShapes.id, { onDelete: "restrict" }),
    isBent: boolean("is_bent").notNull(),
    pipeMaterialId: integer("pipe_material_id")
      .notNull()
      .references(() => pipeMaterials.id, { onDelete: "restrict" }),
    stemMaterialId: integer("stem_material_id")
      .notNull()
      .references(() => stemMaterials.id, { onDelete: "restrict" }),
    finishId: integer("finish_id")
      .notNull()
      .references(() => pipeFinishes.id, { onDelete: "restrict" }),
    lengthMm: numeric("length_mm", { precision: 7, scale: 2, mode: "number" }),
    weightG: numeric("weight_g", { precision: 7, scale: 2, mode: "number" }),
    bowlDiameterMm: numeric("bowl_diameter_mm", {
      precision: 7,
      scale: 2,
      mode: "number",
    }),
    bowlDepthMm: numeric("bowl_depth_mm", {
      precision: 7,
      scale: 2,
      mode: "number",
    }),
    filterId: integer("filter_id")
      .notNull()
      .references(() => pipeFilters.id, { onDelete: "restrict" }),
    statusId: integer("status_id")
      .notNull()
      .default(10)
      .references(() => pipeStatuses.id, { onDelete: "restrict" }),
    price: numeric("price", { precision: 10, scale: 2, mode: "number" }),
    referenceUrl: text("reference_url"),
    notes: text("notes"),
  },
  (table) => [
    check(
      "pipes_length_mm_positive",
      sql`${table.lengthMm} IS NULL OR ${table.lengthMm} > 0`,
    ),
    check(
      "pipes_weight_g_positive",
      sql`${table.weightG} IS NULL OR ${table.weightG} > 0`,
    ),
    check(
      "pipes_bowl_diameter_mm_positive",
      sql`${table.bowlDiameterMm} IS NULL OR ${table.bowlDiameterMm} > 0`,
    ),
    check(
      "pipes_bowl_depth_mm_positive",
      sql`${table.bowlDepthMm} IS NULL OR ${table.bowlDepthMm} > 0`,
    ),
    check(
      "pipes_price_nonnegative",
      sql`${table.price} IS NULL OR ${table.price} >= 0`,
    ),
    index("pipes_status_id_idx").on(table.statusId),
  ],
);

export const pipeMaintenanceEntries = pgTable(
  "pipe_maintenance_entries",
  {
    id: generatedId(),
    pipeId: integer("pipe_id")
      .notNull()
      .references(() => pipes.id, { onDelete: "restrict" }),
    maintenanceActionId: integer("maintenance_action_id")
      .notNull()
      .references(() => maintenanceActions.id, { onDelete: "restrict" }),
    performedAt: timestamp("performed_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
    notes: text("notes"),
  },
  (table) => [
    index("pipe_maintenance_entries_pipe_performed_at_idx").on(
      table.pipeId,
      table.performedAt,
    ),
  ],
);

export const blendManufacturers = pgTable(
  "blend_manufacturers",
  {
    id: generatedId(),
    name: text("name").notNull(),
    url: text("url"),
  },
  (table) => [unique("blend_manufacturers_name_unique").on(table.name)],
);

export const blendTypeCategories = pgTable(
  "blend_type_categories",
  {
    id: generatedId(),
    description: lookupDescription(),
  },
  (table) => [
    unique("blend_type_categories_description_unique").on(table.description),
  ],
);

export const blendTypes = pgTable(
  "blend_types",
  {
    id: generatedId(),
    description: lookupDescription(),
    blendTypeCategoryId: integer("blend_type_category_id")
      .notNull()
      .references(() => blendTypeCategories.id, { onDelete: "restrict" }),
  },
  (table) => [unique("blend_types_description_unique").on(table.description)],
);

export const blendCuts = pgTable(
  "blend_cuts",
  {
    id: generatedId(),
    description: lookupDescription(),
  },
  (table) => [unique("blend_cuts_description_unique").on(table.description)],
);

export const ingredients = pgTable(
  "ingredients",
  {
    id: generatedId(),
    description: lookupDescription(),
  },
  (table) => [unique("ingredients_description_unique").on(table.description)],
);

export const flavorings = pgTable(
  "flavorings",
  {
    id: generatedId(),
    description: lookupDescription(),
  },
  (table) => [unique("flavorings_description_unique").on(table.description)],
);

export const packagingTypes = pgTable(
  "packaging_types",
  {
    id: generatedId(),
    description: lookupDescription(),
  },
  (table) => [
    unique("packaging_types_description_unique").on(table.description),
  ],
);

export const blends = pgTable(
  "blends",
  {
    id: generatedId(),
    manufacturerId: integer("manufacturer_id")
      .notNull()
      .references(() => blendManufacturers.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    blendTypeId: integer("blend_type_id")
      .notNull()
      .references(() => blendTypes.id, { onDelete: "restrict" }),
    blendCutId: integer("blend_cut_id")
      .notNull()
      .references(() => blendCuts.id, { onDelete: "restrict" }),
    rating: numeric("rating", { precision: 3, scale: 2, mode: "number" }),
    tobaccoReviewsId: integer("tobacco_reviews_id"),
    tobaccoReviewsRating: numeric("tobacco_reviews_rating", {
      precision: 4,
      scale: 2,
      mode: "number",
    }),
    tobaccoReviewsUrl: text("tobacco_reviews_url"),
    notes: text("notes"),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => [
    unique("blends_manufacturer_name_unique").on(
      table.manufacturerId,
      table.name,
    ),
    unique("blends_tobacco_reviews_id_unique").on(table.tobaccoReviewsId),
    check(
      "blends_rating_range",
      sql`${table.rating} IS NULL OR ${table.rating} BETWEEN 1 AND 4`,
    ),
  ],
);

export const blendIngredients = pgTable(
  "blend_ingredients",
  {
    blendId: integer("blend_id")
      .notNull()
      .references(() => blends.id, { onDelete: "cascade" }),
    ingredientId: integer("ingredient_id")
      .notNull()
      .references(() => ingredients.id, { onDelete: "restrict" }),
  },
  (table) => [
    primaryKey({
      name: "blend_ingredients_pk",
      columns: [table.blendId, table.ingredientId],
    }),
  ],
);

export const blendFlavorings = pgTable(
  "blend_flavorings",
  {
    blendId: integer("blend_id")
      .notNull()
      .references(() => blends.id, { onDelete: "cascade" }),
    flavoringId: integer("flavoring_id")
      .notNull()
      .references(() => flavorings.id, { onDelete: "restrict" }),
  },
  (table) => [
    primaryKey({
      name: "blend_flavorings_pk",
      columns: [table.blendId, table.flavoringId],
    }),
  ],
);

export const blendPackagings = pgTable(
  "blend_packagings",
  {
    blendId: integer("blend_id")
      .notNull()
      .references(() => blends.id, { onDelete: "cascade" }),
    packagingTypeId: integer("packaging_type_id")
      .notNull()
      .references(() => packagingTypes.id, { onDelete: "restrict" }),
  },
  (table) => [
    primaryKey({
      name: "blend_packagings_pk",
      columns: [table.blendId, table.packagingTypeId],
    }),
  ],
);

export const cellarStatuses = pgTable(
  "cellar_statuses",
  {
    id: integer("id").primaryKey(),
    description: lookupDescription(),
  },
  (table) => [
    unique("cellar_statuses_description_unique").on(table.description),
  ],
);

export const cellarItems = pgTable(
  "cellar_items",
  {
    id: generatedId(),
    blendId: integer("blend_id")
      .notNull()
      .references(() => blends.id, { onDelete: "restrict" }),
    packagingTypeId: integer("packaging_type_id")
      .notNull()
      .references(() => packagingTypes.id, { onDelete: "restrict" }),
    statusId: integer("status_id")
      .notNull()
      .default(20)
      .references(() => cellarStatuses.id, { onDelete: "restrict" }),
    quantityGrams: numeric("quantity_grams", {
      precision: 10,
      scale: 2,
      mode: "number",
    })
      .notNull()
      .default(50),
    tinDate: timestamp("tin_date", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
    openedDate: timestamp("opened_date", {
      withTimezone: true,
      mode: "date",
    }),
    ageAtOpenDays: integer("age_at_open_days").notNull().default(0),
  },
  (table) => [
    check(
      "cellar_items_quantity_nonnegative",
      sql`${table.quantityGrams} >= 0`,
    ),
    check(
      "cellar_items_archived_quantity_zero",
      sql`${table.statusId} <> 40 OR ${table.quantityGrams} = 0`,
    ),
    index("cellar_items_blend_id_idx").on(table.blendId),
    index("cellar_items_status_id_idx").on(table.statusId),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    id: generatedId(),
    occurredAt: timestamp("occurred_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
    pipeId: integer("pipe_id")
      .notNull()
      .references(() => pipes.id, { onDelete: "restrict" }),
    cellarItemId: integer("cellar_item_id")
      .notNull()
      .references(() => cellarItems.id, { onDelete: "restrict" }),
    notes: text("notes"),
    functionScore: integer("function_score"),
    flavorScore: integer("flavor_score"),
    isBreakIn: boolean("is_break_in").notNull().default(false),
    deletedAt: timestamp("deleted_at", {
      withTimezone: true,
      mode: "date",
    }),
  },
  (table) => [
    check(
      "sessions_function_score_range",
      sql`${table.functionScore} IS NULL OR ${table.functionScore} BETWEEN 1 AND 4`,
    ),
    check(
      "sessions_flavor_score_range",
      sql`${table.flavorScore} IS NULL OR ${table.flavorScore} BETWEEN 1 AND 4`,
    ),
    index("sessions_pipe_occurred_at_idx").on(
      table.pipeId,
      table.occurredAt,
    ),
    index("sessions_cellar_item_occurred_at_idx").on(
      table.cellarItemId,
      table.occurredAt,
    ),
  ],
);

export const supplies = pgTable(
  "supplies",
  {
    id: generatedId(),
    description: text("description").notNull(),
    unitsPerPackage: integer("units_per_package").notNull(),
    packagesOnHand: integer("packages_on_hand").notNull().default(0),
  },
  (table) => [
    check(
      "supplies_units_per_package_positive",
      sql`${table.unitsPerPackage} > 0`,
    ),
    check(
      "supplies_packages_on_hand_nonnegative",
      sql`${table.packagesOnHand} >= 0`,
    ),
  ],
);
