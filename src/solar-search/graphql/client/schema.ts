/**
 * Copyright 2026 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { GraphQLClient, RequestOptions } from 'graphql-request';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: any; output: any; }
};

export type Board = {
  __typename?: 'Board';
  /** Data associated with the CMSIS ecosystem. If this field is null, the board is not supported by the ecosystem. */
  cmsis?: Maybe<CmsisBoardData>;
  debug_interfaces: Array<DebugInterface>;
  description?: Maybe<Scalars['String']['output']>;
  detect_code?: Maybe<Scalars['String']['output']>;
  devices: Array<MountedDevice>;
  documentation: Array<Documentation>;
  features: Array<BoardFeature>;
  guide_url?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  image_url?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  revision?: Maybe<Scalars['String']['output']>;
  vendor: Vendor;
};

export type BoardFeature = {
  __typename?: 'BoardFeature';
  category: Scalars['String']['output'];
  default_name: Scalars['String']['output'];
  detail: Scalars['String']['output'];
};

export type BoardPackId = {
  __typename?: 'BoardPackId';
  name: Scalars['String']['output'];
  vendor_slug: Scalars['String']['output'];
  version: Scalars['String']['output'];
};

export type BoardSearchResult = {
  __typename?: 'BoardSearchResult';
  /** The number of example projects associated with the board. */
  example_projects_count: Scalars['Int']['output'];
  highlights: SearchResultHighlights;
  /** The canonical identifier for the board. */
  id: Scalars['String']['output'];
  /** The URL for the image of the board. */
  image_url?: Maybe<Scalars['String']['output']>;
  /** The name of the board. */
  name: Scalars['String']['output'];
  /** The revision of the board. */
  revision?: Maybe<Scalars['String']['output']>;
  /** The canonical vendor for the board. */
  vendor: Vendor;
};

export type BoardSearchResultCollection = {
  __typename?: 'BoardSearchResultCollection';
  facets: SearchResultCollectionFacets;
  metadata: CollectionMetaData;
  results: Array<BoardSearchResult>;
};

export type BoardSuggestion = {
  __typename?: 'BoardSuggestion';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  revision?: Maybe<Scalars['String']['output']>;
};

export type CmsisBoardData = {
  __typename?: 'CmsisBoardData';
  /** The CMSIS id of the source pack in which the board is defined. */
  cmsis_pack_id: BoardPackId;
  /** The SolAr pack family id of the pack family in which the board is defined. */
  pack_family_id: Scalars['String']['output'];
};

/** Filter for the CMSIS ecosystem [board identifier](https://open-cmsis-pack.github.io/Open-CMSIS-Pack-Spec/main/html/pdsc_boards_pg.html#element_board). */
export type CmsisBoardIdFilterStrawberry = {
  /** The board name as described by the CMSIS ecosystem. */
  name: Scalars['String']['input'];
  /** The board revision as described by the CMSIS ecosystem. This is optional and if not provided will return all boards that match name, vendor and any revision. */
  revision?: InputMaybe<Scalars['String']['input']>;
  /** The board vendor as described by the CMSIS ecosystem. */
  vendor: Scalars['String']['input'];
};

/** CMSIS Pack Family ID */
export type CmsisPackFamilyId = {
  __typename?: 'CmsisPackFamilyId';
  /** Pack family name */
  name: Scalars['String']['output'];
  /** CMSIS Pack Vendor name (non-canonical) */
  vendor: Scalars['String']['output'];
};

export type CollectionMetaData = {
  __typename?: 'CollectionMetaData';
  /** The total number of results before pagination. */
  total: Scalars['Int']['output'];
};

/** Fields specific to the csolution project format. */
export type CsolutionProjectFormat = ProjectFormat & {
  __typename?: 'CsolutionProjectFormat';
  /** The version of CMSIS required by the project, if specified. */
  cmsis_version?: Maybe<Scalars['String']['output']>;
  type: ProjectFormatType;
};

export type DebugInterface = {
  __typename?: 'DebugInterface';
  adapter: Scalars['String']['output'];
  connector: Scalars['String']['output'];
};

export type Device = {
  __typename?: 'Device';
  description?: Maybe<Scalars['String']['output']>;
  family: DeviceFamilyReference;
  id: Scalars['String']['output'];
  memory: Array<Memory>;
  name: Scalars['String']['output'];
  processors: Array<Processor>;
  source_pack_id: SourcePackId;
  source_pack_slug: Scalars['String']['output'];
  sub_family?: Maybe<DeviceFamilyReference>;
  vendor: Vendor;
};

export type DeviceFamily = {
  __typename?: 'DeviceFamily';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  vendor: Vendor;
};

export type DeviceFamilyCollection = {
  __typename?: 'DeviceFamilyCollection';
  metadata: CollectionMetaData;
  results: Array<DeviceFamilySearchResult>;
};

export type DeviceFamilyReference = {
  __typename?: 'DeviceFamilyReference';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type DeviceFamilySearchResult = {
  __typename?: 'DeviceFamilySearchResult';
  id: Scalars['String']['output'];
};

export type DeviceGroup = {
  __typename?: 'DeviceGroup';
  family: DeviceFamilyReference;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  sub_family?: Maybe<DeviceFamilyReference>;
  vendor: Vendor;
};

export type DeviceSearchResult = {
  __typename?: 'DeviceSearchResult';
  cores: Array<Scalars['String']['output']>;
  family: Scalars['String']['output'];
  highlights: SearchResultHighlights;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  sub_family?: Maybe<Scalars['String']['output']>;
  vendor: Vendor;
};

export type DeviceSearchResultCollection = {
  __typename?: 'DeviceSearchResultCollection';
  facets: SearchResultCollectionFacets;
  metadata: CollectionMetaData;
  results: Array<DeviceSearchResult>;
};

export type DeviceSubFamily = {
  __typename?: 'DeviceSubFamily';
  family: DeviceFamilyReference;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  vendor: Vendor;
};

export type DeviceSubFamilyCollection = {
  __typename?: 'DeviceSubFamilyCollection';
  metadata: CollectionMetaData;
  results: Array<DeviceSubFamilySearchResult>;
};

export type DeviceSubFamilySearchResult = {
  __typename?: 'DeviceSubFamilySearchResult';
  id: Scalars['String']['output'];
};

export type Documentation = {
  __typename?: 'Documentation';
  category: Scalars['String']['output'];
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type Facet = {
  __typename?: 'Facet';
  /** The human readable label for the facet. */
  label: Scalars['String']['output'];
  /** The web safe identifier for the facet. This should be used to apply the facet as a filter. */
  value: Scalars['String']['output'];
};

export type GroupedDeviceCollectionMetadata = {
  __typename?: 'GroupedDeviceCollectionMetadata';
  total_devices: Scalars['Int']['output'];
  total_families: Scalars['Int']['output'];
};

export type GroupedDeviceResult = {
  __typename?: 'GroupedDeviceResult';
  cores: Array<Scalars['String']['output']>;
  highlights: SearchResultHighlights;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type GroupedDeviceResultCollection = {
  __typename?: 'GroupedDeviceResultCollection';
  facets: SearchResultCollectionFacets;
  metadata: GroupedDeviceCollectionMetadata;
  results: Array<GroupedFamilyResult>;
};

export type GroupedFamilyResult = {
  __typename?: 'GroupedFamilyResult';
  devices: Array<GroupedDeviceResult>;
  highlights: SearchResultHighlights;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  sub_family: Array<GroupedSubFamilyResult>;
  total: Scalars['Int']['output'];
  vendor: Scalars['String']['output'];
};

export type GroupedSubFamilyResult = {
  __typename?: 'GroupedSubFamilyResult';
  devices: Array<GroupedDeviceResult>;
  highlights: SearchResultHighlights;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  total: Scalars['Int']['output'];
};

export type Memory = {
  __typename?: 'Memory';
  name: Scalars['String']['output'];
  size: Scalars['Int']['output'];
};

export type MountedDevice = {
  __typename?: 'MountedDevice';
  id: Scalars['String']['output'];
  memory: Array<Memory>;
  name: Scalars['String']['output'];
  processors: Array<Processor>;
  source_pack_id: SourcePackId;
  source_pack_slug: Scalars['String']['output'];
  type: Scalars['String']['output'];
  vendor: Vendor;
};

export type PackContents = {
  __typename?: 'PackContents';
  boards: Scalars['Int']['output'];
  devices: Scalars['Int']['output'];
};

export type PackFamily = {
  __typename?: 'PackFamily';
  cmsis_id: CmsisPackFamilyId;
  contents: PackContents;
  current_release: PackRelease;
  description: Scalars['String']['output'];
  id: Scalars['String']['output'];
  is_deprecated: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  overview_url?: Maybe<Scalars['String']['output']>;
  releases: Array<PackRelease>;
  vendor: Vendor;
};

export type PackFamilyCollection = {
  __typename?: 'PackFamilyCollection';
  facets: SearchResultPackFamilyFacets;
  metadata: CollectionMetaData;
  results: Array<PackFamilySearchResult>;
};

export type PackFamilySearchResult = {
  __typename?: 'PackFamilySearchResult';
  contents: PackContents;
  current_release: PackRelease;
  description: Scalars['String']['output'];
  highlights: SearchResultHighlights;
  id: Scalars['String']['output'];
  is_deprecated: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  vendor: Vendor;
};

/** Filter for the CMSIS ecosystem pack identifier. */
export type PackFilterStrawberry = {
  /** The name of the pack as described by the CMSIS ecosystem. */
  name: Scalars['String']['input'];
  /** The canonical vendor identifier for the pack. */
  vendor_slug: Scalars['String']['input'];
  /** The version of the pack as described by the CMSIS ecosystem. */
  version: Scalars['String']['input'];
};

export type PackRelease = {
  __typename?: 'PackRelease';
  date?: Maybe<Scalars['Date']['output']>;
  is_prerelease: Scalars['Boolean']['output'];
  notes: Scalars['String']['output'];
  url: Scalars['String']['output'];
  version: Scalars['String']['output'];
};

export type Processor = {
  __typename?: 'Processor';
  core: Scalars['String']['output'];
  cortexm_vector_extensions: Scalars['String']['output'];
  digital_signal_processor: Scalars['String']['output'];
  endian: Scalars['String']['output'];
  floating_point_unit: Scalars['String']['output'];
  max_core_clock_frequency: Scalars['Int']['output'];
  memory_protection_unit: Scalars['String']['output'];
  trust_zone: Scalars['String']['output'];
};

export type Project = {
  __typename?: 'Project';
  /** The canonical board identifier that the project is associated with. */
  board_id: Scalars['String']['output'];
  /** The project description. */
  description: Scalars['String']['output'];
  /** The URL to download the project files in compressed zip format. */
  download_url: Scalars['String']['output'];
  /** Fields specific to the format that the project is defined in. */
  format: ProjectFormat;
  /** The canonical identifier for the project. */
  id: Scalars['String']['output'];
  /** The name of the project. */
  name: Scalars['String']['output'];
  /** Fields that detail where the project originates from. */
  origin: ProjectOrigin;
  /** Set of required toolchains for the project. */
  toolchains: Array<ProjectToolchain>;
};

export type ProjectCollection = {
  __typename?: 'ProjectCollection';
  metadata: CollectionMetaData;
  results: Array<Project>;
};

export type ProjectFormat = {
  type: ProjectFormatType;
};

export enum ProjectFormatType {
  Csolution = 'CSOLUTION',
  Uvmpw = 'UVMPW',
  Uvprojx = 'UVPROJX'
}

export type ProjectOrigin = {
  __typename?: 'ProjectOrigin';
  /** Where the project comes from, e.g. github or CMSIS pack. */
  type?: Maybe<Scalars['String']['output']>;
  /** The URL to where the project comes from, e.g. a github repository URL */
  url?: Maybe<Scalars['String']['output']>;
};

export type ProjectToolchain = {
  __typename?: 'ProjectToolchain';
  /** The name of the required toolchain. */
  name: ProjectToolchainName;
  /** The version of the required toolchain. Optional if a pinned version has not been specified in the project. */
  version?: Maybe<Scalars['String']['output']>;
};

export enum ProjectToolchainName {
  Ac5 = 'AC5',
  Ac6 = 'AC6',
  Clang = 'CLANG',
  Gcc = 'GCC',
  Iar = 'IAR'
}

export type Query = {
  __typename?: 'Query';
  boards: Array<Board>;
  get_board?: Maybe<Board>;
  get_board_suggestions: Array<BoardSuggestion>;
  get_device?: Maybe<Device>;
  get_device_family?: Maybe<DeviceFamily>;
  get_device_group?: Maybe<DeviceGroup>;
  get_device_sub_family?: Maybe<DeviceSubFamily>;
  get_pack_family?: Maybe<PackFamily>;
  search_boards: BoardSearchResultCollection;
  search_device_families: DeviceFamilyCollection;
  search_device_sub_families: DeviceSubFamilyCollection;
  search_devices?: Maybe<DeviceSearchResultCollection>;
  search_grouped_devices?: Maybe<GroupedDeviceResultCollection>;
  search_pack_families: PackFamilyCollection;
  search_projects: ProjectCollection;
};


export type QueryGet_BoardArgs = {
  id: Scalars['String']['input'];
};


export type QueryGet_Board_SuggestionsArgs = {
  cmsis_ecosystem_support?: InputMaybe<Scalars['Boolean']['input']>;
  pack_family_id?: InputMaybe<Scalars['String']['input']>;
  q?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGet_DeviceArgs = {
  id: Scalars['String']['input'];
};


export type QueryGet_Device_FamilyArgs = {
  id: Scalars['String']['input'];
};


export type QueryGet_Device_GroupArgs = {
  id: Scalars['String']['input'];
};


export type QueryGet_Device_Sub_FamilyArgs = {
  id: Scalars['String']['input'];
};


export type QueryGet_Pack_FamilyArgs = {
  id: Scalars['String']['input'];
};


export type QuerySearch_BoardsArgs = {
  cmsis_board_id?: InputMaybe<CmsisBoardIdFilterStrawberry>;
  cmsis_ecosystem_support?: InputMaybe<Scalars['Boolean']['input']>;
  core?: InputMaybe<Array<Scalars['String']['input']>>;
  device_id?: InputMaybe<Scalars['String']['input']>;
  has_example_projects?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  pack?: InputMaybe<PackFilterStrawberry>;
  pack_family_id?: InputMaybe<Scalars['String']['input']>;
  q?: InputMaybe<Scalars['String']['input']>;
  sort_by?: InputMaybe<Scalars['String']['input']>;
  vendor_slug?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QuerySearch_Device_FamiliesArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


export type QuerySearch_Device_Sub_FamiliesArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


export type QuerySearch_DevicesArgs = {
  core?: InputMaybe<Array<Scalars['String']['input']>>;
  family?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  pack_family_id?: InputMaybe<Scalars['String']['input']>;
  q?: InputMaybe<Scalars['String']['input']>;
  sort_by?: InputMaybe<Scalars['String']['input']>;
  sub_family?: InputMaybe<Scalars['String']['input']>;
  vendor_slug?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QuerySearch_Grouped_DevicesArgs = {
  core?: InputMaybe<Array<Scalars['String']['input']>>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  pack_family_id?: InputMaybe<Scalars['String']['input']>;
  q?: InputMaybe<Scalars['String']['input']>;
  sort_by?: InputMaybe<Scalars['String']['input']>;
  vendor_slug?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QuerySearch_Pack_FamiliesArgs = {
  contains_boards?: Scalars['Boolean']['input'];
  contains_devices?: Scalars['Boolean']['input'];
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  q?: InputMaybe<Scalars['String']['input']>;
  show_deprecated_packs?: Scalars['Boolean']['input'];
  sort_by?: InputMaybe<Scalars['String']['input']>;
  vendor_slug?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QuerySearch_ProjectsArgs = {
  board_id?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  q?: InputMaybe<Scalars['String']['input']>;
};

export type SearchResultCollectionFacets = {
  __typename?: 'SearchResultCollectionFacets';
  /** The set of applicable core filters for the returned collection. */
  cores: Array<Facet>;
  /** The set of applicable vendor filters for the returned collection. */
  vendors: Array<Facet>;
};

/** Search highlights indicate where in the field the given query matched. Highlights are returned as strings with html <em> tags for the matched substring. */
export type SearchResultHighlights = {
  __typename?: 'SearchResultHighlights';
  name?: Maybe<Scalars['String']['output']>;
};

export type SearchResultPackFamilyFacets = {
  __typename?: 'SearchResultPackFamilyFacets';
  vendors: Array<Facet>;
};

export type SourcePackId = {
  __typename?: 'SourcePackId';
  name: Scalars['String']['output'];
  vendor: Scalars['String']['output'];
  version: Scalars['String']['output'];
};

/** Fields specific to uvision project formats. */
export type UvProjectFormat = ProjectFormat & {
  __typename?: 'UvProjectFormat';
  /** Indicates whether this project is convertible to csolution using the latest converter tool. */
  convertible: Scalars['Boolean']['output'];
  type: ProjectFormatType;
};

export type Vendor = {
  __typename?: 'Vendor';
  /** The human readable name for the vendor. */
  name: Scalars['String']['output'];
  /** The canonical identifier for the vendor. */
  slug: Scalars['String']['output'];
};

export type GetBoardQueryVariables = Exact<{
  name: Scalars['String']['input'];
  vendor: Scalars['String']['input'];
  revision: Scalars['String']['input'];
}>;


export type GetBoardQuery = { __typename?: 'Query', search_boards: { __typename?: 'BoardSearchResultCollection', results: Array<{ __typename?: 'BoardSearchResult', id: string, example_projects_count: number }> } };

export type GetBoardProjectsQueryVariables = Exact<{
  boardId: Scalars['String']['input'];
  offset: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
}>;


export type GetBoardProjectsQuery = { __typename?: 'Query', search_projects: { __typename?: 'ProjectCollection', results: Array<{ __typename?: 'Project', description: string, download_url: string, name: string, id: string, format: { __typename?: 'CsolutionProjectFormat', cmsis_version?: string | null, type: ProjectFormatType } | { __typename: 'UvProjectFormat', convertible: boolean, type: ProjectFormatType } }> } };

export type GetAllDevicesQueryVariables = Exact<{
  offset: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
}>;


export type GetAllDevicesQuery = { __typename?: 'Query', search_devices?: { __typename?: 'DeviceSearchResultCollection', results: Array<{ __typename?: 'DeviceSearchResult', id: string, family: string, sub_family?: string | null, name: string, vendor: { __typename?: 'Vendor', name: string } }>, metadata: { __typename?: 'CollectionMetaData', total: number } } | null };

export type GetDeviceQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetDeviceQuery = { __typename?: 'Query', get_device?: { __typename?: 'Device', id: string, name: string, description?: string | null, vendor: { __typename?: 'Vendor', name: string }, family: { __typename?: 'DeviceFamilyReference', id: string, name: string }, sub_family?: { __typename?: 'DeviceFamilyReference', id: string, name: string } | null, memory: Array<{ __typename?: 'Memory', name: string, size: number }>, processors: Array<{ __typename?: 'Processor', core: string, cortexm_vector_extensions: string, digital_signal_processor: string, endian: string, floating_point_unit: string, max_core_clock_frequency: number, memory_protection_unit: string, trust_zone: string }>, source_pack_id: { __typename?: 'SourcePackId', name: string, vendor: string, version: string } } | null };

export type GetAllBoardsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllBoardsQuery = { __typename?: 'Query', boards: Array<{ __typename?: 'Board', id: string, name: string, revision?: string | null, vendor: { __typename?: 'Vendor', name: string }, cmsis?: { __typename?: 'CmsisBoardData', pack_family_id: string, cmsis_pack_id: { __typename?: 'BoardPackId', version: string } } | null }> };

export type GetAllBoardsWithDetailsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllBoardsWithDetailsQuery = { __typename?: 'Query', boards: Array<{ __typename?: 'Board', id: string, name: string, revision?: string | null, description?: string | null, vendor: { __typename?: 'Vendor', name: string }, devices: Array<{ __typename?: 'MountedDevice', id: string, name: string, vendor: { __typename?: 'Vendor', name: string } }>, cmsis?: { __typename?: 'CmsisBoardData', pack_family_id: string, cmsis_pack_id: { __typename?: 'BoardPackId', version: string } } | null }> };

export type GetBoardDetailsQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetBoardDetailsQuery = { __typename?: 'Query', get_board?: { __typename?: 'Board', id: string, name: string, revision?: string | null, description?: string | null, image_url?: string | null, vendor: { __typename?: 'Vendor', name: string }, cmsis?: { __typename?: 'CmsisBoardData', pack_family_id: string, cmsis_pack_id: { __typename?: 'BoardPackId', version: string } } | null, debug_interfaces: Array<{ __typename?: 'DebugInterface', adapter: string, connector: string }>, devices: Array<{ __typename?: 'MountedDevice', id: string, name: string, vendor: { __typename?: 'Vendor', name: string } }> } | null };

export type ResolvePackFamilyQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type ResolvePackFamilyQuery = { __typename?: 'Query', get_pack_family?: { __typename?: 'PackFamily', id: string, cmsis_id: { __typename?: 'CmsisPackFamilyId', vendor: string, name: string } } | null };


export const GetBoardDocument = gql`
    query getBoard($name: String!, $vendor: String!, $revision: String!) {
  search_boards(
    has_example_projects: true
    cmsis_board_id: {name: $name, vendor: $vendor, revision: $revision}
  ) {
    results {
      id
      example_projects_count
    }
  }
}
    `;
export const GetBoardProjectsDocument = gql`
    query getBoardProjects($boardId: String!, $offset: Int!, $limit: Int!) {
  search_projects(board_id: $boardId, offset: $offset, limit: $limit) {
    results {
      description
      download_url
      format {
        type
        ... on UvProjectFormat {
          __typename
          convertible
          type
        }
        ... on CsolutionProjectFormat {
          cmsis_version
          type
        }
      }
      name
      id
    }
  }
}
    `;
export const GetAllDevicesDocument = gql`
    query getAllDevices($offset: Int!, $limit: Int!) {
  search_devices(offset: $offset, limit: $limit) {
    results {
      id
      vendor {
        name
      }
      family
      sub_family
      name
    }
    metadata {
      total
    }
  }
}
    `;
export const GetDeviceDocument = gql`
    query getDevice($id: String!) {
  get_device(id: $id) {
    id
    name
    description
    vendor {
      name
    }
    family {
      id
      name
    }
    sub_family {
      id
      name
    }
    memory {
      name
      size
    }
    processors {
      core
      cortexm_vector_extensions
      digital_signal_processor
      endian
      floating_point_unit
      max_core_clock_frequency
      memory_protection_unit
      trust_zone
    }
    source_pack_id {
      name
      vendor
      version
    }
  }
}
    `;
export const GetAllBoardsDocument = gql`
    query getAllBoards {
  boards {
    id
    name
    revision
    vendor {
      name
    }
    cmsis {
      pack_family_id
      cmsis_pack_id {
        version
      }
    }
  }
}
    `;
export const GetAllBoardsWithDetailsDocument = gql`
    query getAllBoardsWithDetails {
  boards {
    id
    name
    revision
    description
    vendor {
      name
    }
    devices {
      id
      name
      vendor {
        name
      }
    }
    cmsis {
      pack_family_id
      cmsis_pack_id {
        version
      }
    }
  }
}
    `;
export const GetBoardDetailsDocument = gql`
    query getBoardDetails($id: String!) {
  get_board(id: $id) {
    id
    vendor {
      name
    }
    name
    revision
    description
    image_url
    cmsis {
      pack_family_id
      cmsis_pack_id {
        version
      }
    }
    debug_interfaces {
      adapter
      connector
    }
    devices {
      id
      name
      vendor {
        name
      }
    }
  }
}
    `;
export const ResolvePackFamilyDocument = gql`
    query resolvePackFamily($id: String!) {
  get_pack_family(id: $id) {
    id
    cmsis_id {
      vendor
      name
    }
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    getBoard(variables: GetBoardQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetBoardQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetBoardQuery>(GetBoardDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getBoard', 'query', variables);
    },
    getBoardProjects(variables: GetBoardProjectsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetBoardProjectsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetBoardProjectsQuery>(GetBoardProjectsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getBoardProjects', 'query', variables);
    },
    getAllDevices(variables: GetAllDevicesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetAllDevicesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAllDevicesQuery>(GetAllDevicesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getAllDevices', 'query', variables);
    },
    getDevice(variables: GetDeviceQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetDeviceQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetDeviceQuery>(GetDeviceDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getDevice', 'query', variables);
    },
    getAllBoards(variables?: GetAllBoardsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetAllBoardsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAllBoardsQuery>(GetAllBoardsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getAllBoards', 'query', variables);
    },
    getAllBoardsWithDetails(variables?: GetAllBoardsWithDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetAllBoardsWithDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAllBoardsWithDetailsQuery>(GetAllBoardsWithDetailsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getAllBoardsWithDetails', 'query', variables);
    },
    getBoardDetails(variables: GetBoardDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetBoardDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetBoardDetailsQuery>(GetBoardDetailsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getBoardDetails', 'query', variables);
    },
    resolvePackFamily(variables: ResolvePackFamilyQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<ResolvePackFamilyQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ResolvePackFamilyQuery>(ResolvePackFamilyDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'resolvePackFamily', 'query', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;
