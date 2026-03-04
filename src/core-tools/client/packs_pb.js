// source: packsproto/packs.proto
/**
 * @fileoverview
 * @enhanceable
 * @suppress {missingRequire} reports error on implicit type usages.
 * @suppress {messageConventions} JS Compiler reports an error if a variable or
 *     field starts with 'MSG_' and isn't a translatable message.
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!
/* eslint-disable */
// @ts-nocheck

var jspb = require('google-protobuf');
var goog = jspb;
var global =
    (typeof globalThis !== 'undefined' && globalThis) ||
    (typeof window !== 'undefined' && window) ||
    (typeof global !== 'undefined' && global) ||
    (typeof self !== 'undefined' && self) ||
    (function () { return this; }).call(null) ||
    Function('return this')();

var google_protobuf_empty_pb = require('google-protobuf/google/protobuf/empty_pb.js');
goog.object.extend(proto, google_protobuf_empty_pb);
var google_protobuf_timestamp_pb = require('google-protobuf/google/protobuf/timestamp_pb.js');
goog.object.extend(proto, google_protobuf_timestamp_pb);
goog.exportSymbol('proto.packs.AbsolutePackFilePath', null, global);
goog.exportSymbol('proto.packs.ApiId', null, global);
goog.exportSymbol('proto.packs.AssetReference', null, global);
goog.exportSymbol('proto.packs.AssetReference.AssetReferenceCase', null, global);
goog.exportSymbol('proto.packs.BoardConstraints', null, global);
goog.exportSymbol('proto.packs.BoardFeature', null, global);
goog.exportSymbol('proto.packs.BoardFeatureDefaultNameMap', null, global);
goog.exportSymbol('proto.packs.BoardFilter', null, global);
goog.exportSymbol('proto.packs.BoardId', null, global);
goog.exportSymbol('proto.packs.BoardImage', null, global);
goog.exportSymbol('proto.packs.BoardInfo', null, global);
goog.exportSymbol('proto.packs.Book', null, global);
goog.exportSymbol('proto.packs.CacheInitialisationStatus', null, global);
goog.exportSymbol('proto.packs.CacheStatus', null, global);
goog.exportSymbol('proto.packs.CleanupRequest', null, global);
goog.exportSymbol('proto.packs.CleanupResponse', null, global);
goog.exportSymbol('proto.packs.CleanupResponse.Result', null, global);
goog.exportSymbol('proto.packs.CleanupResponse.Type', null, global);
goog.exportSymbol('proto.packs.ComponentFile', null, global);
goog.exportSymbol('proto.packs.ComponentFile.Attribute', null, global);
goog.exportSymbol('proto.packs.ComponentFile.Category', null, global);
goog.exportSymbol('proto.packs.ComponentFile.Language', null, global);
goog.exportSymbol('proto.packs.ComponentFile.SourceCase', null, global);
goog.exportSymbol('proto.packs.ComponentFilter', null, global);
goog.exportSymbol('proto.packs.ComponentId', null, global);
goog.exportSymbol('proto.packs.ComponentInfo', null, global);
goog.exportSymbol('proto.packs.DebugInterface', null, global);
goog.exportSymbol('proto.packs.DeviceConstraints', null, global);
goog.exportSymbol('proto.packs.DeviceEntryInfo', null, global);
goog.exportSymbol('proto.packs.DeviceEntryInfo.EntryCase', null, global);
goog.exportSymbol('proto.packs.DeviceFamilyInfo', null, global);
goog.exportSymbol('proto.packs.DeviceFeature', null, global);
goog.exportSymbol('proto.packs.DeviceGroupInfo', null, global);
goog.exportSymbol('proto.packs.DeviceInfo', null, global);
goog.exportSymbol('proto.packs.DeviceMemory', null, global);
goog.exportSymbol('proto.packs.DeviceReference', null, global);
goog.exportSymbol('proto.packs.DeviceSubFamilyInfo', null, global);
goog.exportSymbol('proto.packs.Doc', null, global);
goog.exportSymbol('proto.packs.DownloadPacksRequest', null, global);
goog.exportSymbol('proto.packs.DownloadPacksRequest.RequestCase', null, global);
goog.exportSymbol('proto.packs.DownloadPdscManifestFilesRequest', null, global);
goog.exportSymbol('proto.packs.DownloadResponse', null, global);
goog.exportSymbol('proto.packs.DownloadResponse.Result', null, global);
goog.exportSymbol('proto.packs.DownloadResponse.Type', null, global);
goog.exportSymbol('proto.packs.Dsp', null, global);
goog.exportSymbol('proto.packs.Endian', null, global);
goog.exportSymbol('proto.packs.Example', null, global);
goog.exportSymbol('proto.packs.ExampleEnvironment', null, global);
goog.exportSymbol('proto.packs.ExampleId', null, global);
goog.exportSymbol('proto.packs.Fpu', null, global);
goog.exportSymbol('proto.packs.GetBoardRequest', null, global);
goog.exportSymbol('proto.packs.GetDeviceEntryRequest', null, global);
goog.exportSymbol('proto.packs.GetExampleRequest', null, global);
goog.exportSymbol('proto.packs.IndexStatus', null, global);
goog.exportSymbol('proto.packs.ListBoardsRequest', null, global);
goog.exportSymbol('proto.packs.ListComponentsRequest', null, global);
goog.exportSymbol('proto.packs.ListDevicesRequest', null, global);
goog.exportSymbol('proto.packs.ListRefAppsRequest', null, global);
goog.exportSymbol('proto.packs.ListTemplatesRequest', null, global);
goog.exportSymbol('proto.packs.ManifestId', null, global);
goog.exportSymbol('proto.packs.Mpu', null, global);
goog.exportSymbol('proto.packs.Mve', null, global);
goog.exportSymbol('proto.packs.Pacbti', null, global);
goog.exportSymbol('proto.packs.PackContents', null, global);
goog.exportSymbol('proto.packs.PackDeprecation', null, global);
goog.exportSymbol('proto.packs.PackDownloadRequest', null, global);
goog.exportSymbol('proto.packs.PackDownloadRequest.VersionCase', null, global);
goog.exportSymbol('proto.packs.PackDownloadRequests', null, global);
goog.exportSymbol('proto.packs.PackFamilyId', null, global);
goog.exportSymbol('proto.packs.PackFamilyInfo', null, global);
goog.exportSymbol('proto.packs.PackFileReference', null, global);
goog.exportSymbol('proto.packs.PackId', null, global);
goog.exportSymbol('proto.packs.PackIds', null, global);
goog.exportSymbol('proto.packs.PackLoadStatus', null, global);
goog.exportSymbol('proto.packs.PackReleaseInfo', null, global);
goog.exportSymbol('proto.packs.PackRepository', null, global);
goog.exportSymbol('proto.packs.PackScope', null, global);
goog.exportSymbol('proto.packs.PackScope.PackScopeCase', null, global);
goog.exportSymbol('proto.packs.PackScopePreset', null, global);
goog.exportSymbol('proto.packs.PackStatus', null, global);
goog.exportSymbol('proto.packs.Processor', null, global);
goog.exportSymbol('proto.packs.RefApp', null, global);
goog.exportSymbol('proto.packs.RefAppId', null, global);
goog.exportSymbol('proto.packs.RelatedComponent', null, global);
goog.exportSymbol('proto.packs.ResolveHardwareRequest', null, global);
goog.exportSymbol('proto.packs.ResolvedHardware', null, global);
goog.exportSymbol('proto.packs.Secure', null, global);
goog.exportSymbol('proto.packs.ServiceVersion', null, global);
goog.exportSymbol('proto.packs.TargetOptions', null, global);
goog.exportSymbol('proto.packs.Template', null, global);
goog.exportSymbol('proto.packs.TemplateId', null, global);
goog.exportSymbol('proto.packs.ToolchainOptions', null, global);
goog.exportSymbol('proto.packs.Tz', null, global);
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.ManifestId = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.ManifestId, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.ManifestId.displayName = 'proto.packs.ManifestId';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.DownloadPdscManifestFilesRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.packs.DownloadPdscManifestFilesRequest.repeatedFields_, null);
};
goog.inherits(proto.packs.DownloadPdscManifestFilesRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.DownloadPdscManifestFilesRequest.displayName = 'proto.packs.DownloadPdscManifestFilesRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.PackDownloadRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.packs.PackDownloadRequest.oneofGroups_);
};
goog.inherits(proto.packs.PackDownloadRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.PackDownloadRequest.displayName = 'proto.packs.PackDownloadRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.PackDownloadRequests = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.packs.PackDownloadRequests.repeatedFields_, null);
};
goog.inherits(proto.packs.PackDownloadRequests, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.PackDownloadRequests.displayName = 'proto.packs.PackDownloadRequests';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.DownloadPacksRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.packs.DownloadPacksRequest.oneofGroups_);
};
goog.inherits(proto.packs.DownloadPacksRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.DownloadPacksRequest.displayName = 'proto.packs.DownloadPacksRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.DownloadResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.DownloadResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.DownloadResponse.displayName = 'proto.packs.DownloadResponse';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.CleanupRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.CleanupRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.CleanupRequest.displayName = 'proto.packs.CleanupRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.CleanupResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.CleanupResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.CleanupResponse.displayName = 'proto.packs.CleanupResponse';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.ListComponentsRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.ListComponentsRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.ListComponentsRequest.displayName = 'proto.packs.ListComponentsRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.PackScope = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.packs.PackScope.oneofGroups_);
};
goog.inherits(proto.packs.PackScope, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.PackScope.displayName = 'proto.packs.PackScope';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.PackIds = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.packs.PackIds.repeatedFields_, null);
};
goog.inherits(proto.packs.PackIds, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.PackIds.displayName = 'proto.packs.PackIds';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.ListBoardsRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.ListBoardsRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.ListBoardsRequest.displayName = 'proto.packs.ListBoardsRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.GetBoardRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.GetBoardRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.GetBoardRequest.displayName = 'proto.packs.GetBoardRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.ListDevicesRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.ListDevicesRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.ListDevicesRequest.displayName = 'proto.packs.ListDevicesRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.GetDeviceEntryRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.GetDeviceEntryRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.GetDeviceEntryRequest.displayName = 'proto.packs.GetDeviceEntryRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.GetExampleRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.GetExampleRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.GetExampleRequest.displayName = 'proto.packs.GetExampleRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.ListRefAppsRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.ListRefAppsRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.ListRefAppsRequest.displayName = 'proto.packs.ListRefAppsRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.ListTemplatesRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.ListTemplatesRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.ListTemplatesRequest.displayName = 'proto.packs.ListTemplatesRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.ServiceVersion = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.ServiceVersion, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.ServiceVersion.displayName = 'proto.packs.ServiceVersion';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.CacheInitialisationStatus = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.CacheInitialisationStatus, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.CacheInitialisationStatus.displayName = 'proto.packs.CacheInitialisationStatus';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.CacheStatus = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.packs.CacheStatus.repeatedFields_, null);
};
goog.inherits(proto.packs.CacheStatus, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.CacheStatus.displayName = 'proto.packs.CacheStatus';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.IndexStatus = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.IndexStatus, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.IndexStatus.displayName = 'proto.packs.IndexStatus';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.PackStatus = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.packs.PackStatus.repeatedFields_, null);
};
goog.inherits(proto.packs.PackStatus, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.PackStatus.displayName = 'proto.packs.PackStatus';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.PackLoadStatus = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.PackLoadStatus, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.PackLoadStatus.displayName = 'proto.packs.PackLoadStatus';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.BoardId = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.BoardId, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.BoardId.displayName = 'proto.packs.BoardId';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.BoardFilter = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.BoardFilter, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.BoardFilter.displayName = 'proto.packs.BoardFilter';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.PackFamilyId = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.PackFamilyId, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.PackFamilyId.displayName = 'proto.packs.PackFamilyId';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.PackId = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.PackId, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.PackId.displayName = 'proto.packs.PackId';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.PackDeprecation = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.PackDeprecation, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.PackDeprecation.displayName = 'proto.packs.PackDeprecation';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.PackContents = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.PackContents, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.PackContents.displayName = 'proto.packs.PackContents';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.PackFamilyInfo = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.packs.PackFamilyInfo.repeatedFields_, null);
};
goog.inherits(proto.packs.PackFamilyInfo, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.PackFamilyInfo.displayName = 'proto.packs.PackFamilyInfo';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.PackRepository = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.PackRepository, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.PackRepository.displayName = 'proto.packs.PackRepository';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.PackReleaseInfo = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.PackReleaseInfo, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.PackReleaseInfo.displayName = 'proto.packs.PackReleaseInfo';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.AssetReference = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.packs.AssetReference.oneofGroups_);
};
goog.inherits(proto.packs.AssetReference, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.AssetReference.displayName = 'proto.packs.AssetReference';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.PackFileReference = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.PackFileReference, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.PackFileReference.displayName = 'proto.packs.PackFileReference';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.AbsolutePackFilePath = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.AbsolutePackFilePath, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.AbsolutePackFilePath.displayName = 'proto.packs.AbsolutePackFilePath';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.DebugInterface = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.DebugInterface, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.DebugInterface.displayName = 'proto.packs.DebugInterface';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.BoardFeature = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.BoardFeature, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.BoardFeature.displayName = 'proto.packs.BoardFeature';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.DeviceFeature = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.DeviceFeature, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.DeviceFeature.displayName = 'proto.packs.DeviceFeature';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.Processor = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.packs.Processor.repeatedFields_, null);
};
goog.inherits(proto.packs.Processor, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.Processor.displayName = 'proto.packs.Processor';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.BoardImage = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.BoardImage, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.BoardImage.displayName = 'proto.packs.BoardImage';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.DeviceMemory = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.DeviceMemory, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.DeviceMemory.displayName = 'proto.packs.DeviceMemory';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.DeviceReference = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.DeviceReference, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.DeviceReference.displayName = 'proto.packs.DeviceReference';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.DeviceFamilyInfo = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.packs.DeviceFamilyInfo.repeatedFields_, null);
};
goog.inherits(proto.packs.DeviceFamilyInfo, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.DeviceFamilyInfo.displayName = 'proto.packs.DeviceFamilyInfo';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.DeviceSubFamilyInfo = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.packs.DeviceSubFamilyInfo.repeatedFields_, null);
};
goog.inherits(proto.packs.DeviceSubFamilyInfo, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.DeviceSubFamilyInfo.displayName = 'proto.packs.DeviceSubFamilyInfo';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.DeviceGroupInfo = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.packs.DeviceGroupInfo.repeatedFields_, null);
};
goog.inherits(proto.packs.DeviceGroupInfo, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.DeviceGroupInfo.displayName = 'proto.packs.DeviceGroupInfo';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.DeviceInfo = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.packs.DeviceInfo.repeatedFields_, null);
};
goog.inherits(proto.packs.DeviceInfo, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.DeviceInfo.displayName = 'proto.packs.DeviceInfo';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.DeviceEntryInfo = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.packs.DeviceEntryInfo.oneofGroups_);
};
goog.inherits(proto.packs.DeviceEntryInfo, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.DeviceEntryInfo.displayName = 'proto.packs.DeviceEntryInfo';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.Book = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.Book, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.Book.displayName = 'proto.packs.Book';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.BoardInfo = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.packs.BoardInfo.repeatedFields_, null);
};
goog.inherits(proto.packs.BoardInfo, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.BoardInfo.displayName = 'proto.packs.BoardInfo';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.BoardFeatureDefaultNameMap = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.BoardFeatureDefaultNameMap, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.BoardFeatureDefaultNameMap.displayName = 'proto.packs.BoardFeatureDefaultNameMap';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.ExampleId = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.ExampleId, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.ExampleId.displayName = 'proto.packs.ExampleId';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.Example = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.packs.Example.repeatedFields_, null);
};
goog.inherits(proto.packs.Example, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.Example.displayName = 'proto.packs.Example';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.RefAppId = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.RefAppId, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.RefAppId.displayName = 'proto.packs.RefAppId';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.RefApp = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.packs.RefApp.repeatedFields_, null);
};
goog.inherits(proto.packs.RefApp, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.RefApp.displayName = 'proto.packs.RefApp';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.TemplateId = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.TemplateId, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.TemplateId.displayName = 'proto.packs.TemplateId';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.Template = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.Template, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.Template.displayName = 'proto.packs.Template';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.RelatedComponent = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.RelatedComponent, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.RelatedComponent.displayName = 'proto.packs.RelatedComponent';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.ExampleEnvironment = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.ExampleEnvironment, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.ExampleEnvironment.displayName = 'proto.packs.ExampleEnvironment';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.ComponentFilter = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.ComponentFilter, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.ComponentFilter.displayName = 'proto.packs.ComponentFilter';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.TargetOptions = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.TargetOptions, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.TargetOptions.displayName = 'proto.packs.TargetOptions';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.ToolchainOptions = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.ToolchainOptions, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.ToolchainOptions.displayName = 'proto.packs.ToolchainOptions';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.ComponentInfo = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.ComponentInfo, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.ComponentInfo.displayName = 'proto.packs.ComponentInfo';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.ComponentId = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.ComponentId, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.ComponentId.displayName = 'proto.packs.ComponentId';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.Doc = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.Doc, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.Doc.displayName = 'proto.packs.Doc';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.ComponentFile = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.packs.ComponentFile.oneofGroups_);
};
goog.inherits(proto.packs.ComponentFile, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.ComponentFile.displayName = 'proto.packs.ComponentFile';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.ApiId = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.ApiId, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.ApiId.displayName = 'proto.packs.ApiId';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.ResolveHardwareRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.ResolveHardwareRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.ResolveHardwareRequest.displayName = 'proto.packs.ResolveHardwareRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.BoardConstraints = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.BoardConstraints, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.BoardConstraints.displayName = 'proto.packs.BoardConstraints';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.DeviceConstraints = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.DeviceConstraints, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.DeviceConstraints.displayName = 'proto.packs.DeviceConstraints';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.packs.ResolvedHardware = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.packs.ResolvedHardware, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.packs.ResolvedHardware.displayName = 'proto.packs.ResolvedHardware';
}



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.ManifestId.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.ManifestId.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.ManifestId} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ManifestId.toObject = function(includeInstance, msg) {
  var f, obj = {
    vendor: jspb.Message.getFieldWithDefault(msg, 1, ""),
    name: jspb.Message.getFieldWithDefault(msg, 2, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.ManifestId}
 */
proto.packs.ManifestId.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.ManifestId;
  return proto.packs.ManifestId.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.ManifestId} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.ManifestId}
 */
proto.packs.ManifestId.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setVendor(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setName(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.ManifestId.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.ManifestId.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.ManifestId} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ManifestId.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getVendor();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getName();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
};


/**
 * optional string vendor = 1;
 * @return {string}
 */
proto.packs.ManifestId.prototype.getVendor = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.ManifestId} returns this
 */
proto.packs.ManifestId.prototype.setVendor = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string name = 2;
 * @return {string}
 */
proto.packs.ManifestId.prototype.getName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.ManifestId} returns this
 */
proto.packs.ManifestId.prototype.setName = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.packs.DownloadPdscManifestFilesRequest.repeatedFields_ = [1];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.DownloadPdscManifestFilesRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.DownloadPdscManifestFilesRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.DownloadPdscManifestFilesRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.DownloadPdscManifestFilesRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    manifestIdsList: jspb.Message.toObjectList(msg.getManifestIdsList(),
    proto.packs.ManifestId.toObject, includeInstance),
    force: jspb.Message.getBooleanFieldWithDefault(msg, 2, false)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.DownloadPdscManifestFilesRequest}
 */
proto.packs.DownloadPdscManifestFilesRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.DownloadPdscManifestFilesRequest;
  return proto.packs.DownloadPdscManifestFilesRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.DownloadPdscManifestFilesRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.DownloadPdscManifestFilesRequest}
 */
proto.packs.DownloadPdscManifestFilesRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.ManifestId;
      reader.readMessage(value,proto.packs.ManifestId.deserializeBinaryFromReader);
      msg.addManifestIds(value);
      break;
    case 2:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setForce(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.DownloadPdscManifestFilesRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.DownloadPdscManifestFilesRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.DownloadPdscManifestFilesRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.DownloadPdscManifestFilesRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getManifestIdsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.packs.ManifestId.serializeBinaryToWriter
    );
  }
  f = message.getForce();
  if (f) {
    writer.writeBool(
      2,
      f
    );
  }
};


/**
 * repeated ManifestId manifest_ids = 1;
 * @return {!Array<!proto.packs.ManifestId>}
 */
proto.packs.DownloadPdscManifestFilesRequest.prototype.getManifestIdsList = function() {
  return /** @type{!Array<!proto.packs.ManifestId>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.packs.ManifestId, 1));
};


/**
 * @param {!Array<!proto.packs.ManifestId>} value
 * @return {!proto.packs.DownloadPdscManifestFilesRequest} returns this
*/
proto.packs.DownloadPdscManifestFilesRequest.prototype.setManifestIdsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.packs.ManifestId=} opt_value
 * @param {number=} opt_index
 * @return {!proto.packs.ManifestId}
 */
proto.packs.DownloadPdscManifestFilesRequest.prototype.addManifestIds = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.packs.ManifestId, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.DownloadPdscManifestFilesRequest} returns this
 */
proto.packs.DownloadPdscManifestFilesRequest.prototype.clearManifestIdsList = function() {
  return this.setManifestIdsList([]);
};


/**
 * optional bool force = 2;
 * @return {boolean}
 */
proto.packs.DownloadPdscManifestFilesRequest.prototype.getForce = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 2, false));
};


/**
 * @param {boolean} value
 * @return {!proto.packs.DownloadPdscManifestFilesRequest} returns this
 */
proto.packs.DownloadPdscManifestFilesRequest.prototype.setForce = function(value) {
  return jspb.Message.setProto3BooleanField(this, 2, value);
};



/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.packs.PackDownloadRequest.oneofGroups_ = [[3,4,5,6]];

/**
 * @enum {number}
 */
proto.packs.PackDownloadRequest.VersionCase = {
  VERSION_NOT_SET: 0,
  ALL: 3,
  SEMVER: 4,
  LATEST: 5,
  CURRENT: 6
};

/**
 * @return {proto.packs.PackDownloadRequest.VersionCase}
 */
proto.packs.PackDownloadRequest.prototype.getVersionCase = function() {
  return /** @type {proto.packs.PackDownloadRequest.VersionCase} */(jspb.Message.computeOneofCase(this, proto.packs.PackDownloadRequest.oneofGroups_[0]));
};



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.PackDownloadRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.PackDownloadRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.PackDownloadRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.PackDownloadRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    vendor: jspb.Message.getFieldWithDefault(msg, 1, ""),
    name: jspb.Message.getFieldWithDefault(msg, 2, ""),
    all: jspb.Message.getBooleanFieldWithDefault(msg, 3, false),
    semver: jspb.Message.getFieldWithDefault(msg, 4, ""),
    latest: jspb.Message.getBooleanFieldWithDefault(msg, 5, false),
    current: jspb.Message.getBooleanFieldWithDefault(msg, 6, false)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.PackDownloadRequest}
 */
proto.packs.PackDownloadRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.PackDownloadRequest;
  return proto.packs.PackDownloadRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.PackDownloadRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.PackDownloadRequest}
 */
proto.packs.PackDownloadRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setVendor(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setName(value);
      break;
    case 3:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setAll(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setSemver(value);
      break;
    case 5:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setLatest(value);
      break;
    case 6:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setCurrent(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.PackDownloadRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.PackDownloadRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.PackDownloadRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.PackDownloadRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getVendor();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getName();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = /** @type {boolean} */ (jspb.Message.getField(message, 3));
  if (f != null) {
    writer.writeBool(
      3,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 4));
  if (f != null) {
    writer.writeString(
      4,
      f
    );
  }
  f = /** @type {boolean} */ (jspb.Message.getField(message, 5));
  if (f != null) {
    writer.writeBool(
      5,
      f
    );
  }
  f = /** @type {boolean} */ (jspb.Message.getField(message, 6));
  if (f != null) {
    writer.writeBool(
      6,
      f
    );
  }
};


/**
 * optional string vendor = 1;
 * @return {string}
 */
proto.packs.PackDownloadRequest.prototype.getVendor = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.PackDownloadRequest} returns this
 */
proto.packs.PackDownloadRequest.prototype.setVendor = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string name = 2;
 * @return {string}
 */
proto.packs.PackDownloadRequest.prototype.getName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.PackDownloadRequest} returns this
 */
proto.packs.PackDownloadRequest.prototype.setName = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional bool all = 3;
 * @return {boolean}
 */
proto.packs.PackDownloadRequest.prototype.getAll = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 3, false));
};


/**
 * @param {boolean} value
 * @return {!proto.packs.PackDownloadRequest} returns this
 */
proto.packs.PackDownloadRequest.prototype.setAll = function(value) {
  return jspb.Message.setOneofField(this, 3, proto.packs.PackDownloadRequest.oneofGroups_[0], value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.packs.PackDownloadRequest} returns this
 */
proto.packs.PackDownloadRequest.prototype.clearAll = function() {
  return jspb.Message.setOneofField(this, 3, proto.packs.PackDownloadRequest.oneofGroups_[0], undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.PackDownloadRequest.prototype.hasAll = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional string semver = 4;
 * @return {string}
 */
proto.packs.PackDownloadRequest.prototype.getSemver = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.PackDownloadRequest} returns this
 */
proto.packs.PackDownloadRequest.prototype.setSemver = function(value) {
  return jspb.Message.setOneofField(this, 4, proto.packs.PackDownloadRequest.oneofGroups_[0], value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.packs.PackDownloadRequest} returns this
 */
proto.packs.PackDownloadRequest.prototype.clearSemver = function() {
  return jspb.Message.setOneofField(this, 4, proto.packs.PackDownloadRequest.oneofGroups_[0], undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.PackDownloadRequest.prototype.hasSemver = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional bool latest = 5;
 * @return {boolean}
 */
proto.packs.PackDownloadRequest.prototype.getLatest = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 5, false));
};


/**
 * @param {boolean} value
 * @return {!proto.packs.PackDownloadRequest} returns this
 */
proto.packs.PackDownloadRequest.prototype.setLatest = function(value) {
  return jspb.Message.setOneofField(this, 5, proto.packs.PackDownloadRequest.oneofGroups_[0], value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.packs.PackDownloadRequest} returns this
 */
proto.packs.PackDownloadRequest.prototype.clearLatest = function() {
  return jspb.Message.setOneofField(this, 5, proto.packs.PackDownloadRequest.oneofGroups_[0], undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.PackDownloadRequest.prototype.hasLatest = function() {
  return jspb.Message.getField(this, 5) != null;
};


/**
 * optional bool current = 6;
 * @return {boolean}
 */
proto.packs.PackDownloadRequest.prototype.getCurrent = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 6, false));
};


/**
 * @param {boolean} value
 * @return {!proto.packs.PackDownloadRequest} returns this
 */
proto.packs.PackDownloadRequest.prototype.setCurrent = function(value) {
  return jspb.Message.setOneofField(this, 6, proto.packs.PackDownloadRequest.oneofGroups_[0], value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.packs.PackDownloadRequest} returns this
 */
proto.packs.PackDownloadRequest.prototype.clearCurrent = function() {
  return jspb.Message.setOneofField(this, 6, proto.packs.PackDownloadRequest.oneofGroups_[0], undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.PackDownloadRequest.prototype.hasCurrent = function() {
  return jspb.Message.getField(this, 6) != null;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.packs.PackDownloadRequests.repeatedFields_ = [1];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.PackDownloadRequests.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.PackDownloadRequests.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.PackDownloadRequests} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.PackDownloadRequests.toObject = function(includeInstance, msg) {
  var f, obj = {
    requestsList: jspb.Message.toObjectList(msg.getRequestsList(),
    proto.packs.PackDownloadRequest.toObject, includeInstance)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.PackDownloadRequests}
 */
proto.packs.PackDownloadRequests.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.PackDownloadRequests;
  return proto.packs.PackDownloadRequests.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.PackDownloadRequests} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.PackDownloadRequests}
 */
proto.packs.PackDownloadRequests.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.PackDownloadRequest;
      reader.readMessage(value,proto.packs.PackDownloadRequest.deserializeBinaryFromReader);
      msg.addRequests(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.PackDownloadRequests.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.PackDownloadRequests.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.PackDownloadRequests} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.PackDownloadRequests.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getRequestsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.packs.PackDownloadRequest.serializeBinaryToWriter
    );
  }
};


/**
 * repeated PackDownloadRequest requests = 1;
 * @return {!Array<!proto.packs.PackDownloadRequest>}
 */
proto.packs.PackDownloadRequests.prototype.getRequestsList = function() {
  return /** @type{!Array<!proto.packs.PackDownloadRequest>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.packs.PackDownloadRequest, 1));
};


/**
 * @param {!Array<!proto.packs.PackDownloadRequest>} value
 * @return {!proto.packs.PackDownloadRequests} returns this
*/
proto.packs.PackDownloadRequests.prototype.setRequestsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.packs.PackDownloadRequest=} opt_value
 * @param {number=} opt_index
 * @return {!proto.packs.PackDownloadRequest}
 */
proto.packs.PackDownloadRequests.prototype.addRequests = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.packs.PackDownloadRequest, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.PackDownloadRequests} returns this
 */
proto.packs.PackDownloadRequests.prototype.clearRequestsList = function() {
  return this.setRequestsList([]);
};



/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.packs.DownloadPacksRequest.oneofGroups_ = [[1,2]];

/**
 * @enum {number}
 */
proto.packs.DownloadPacksRequest.RequestCase = {
  REQUEST_NOT_SET: 0,
  ALL: 1,
  PACK_LIST: 2
};

/**
 * @return {proto.packs.DownloadPacksRequest.RequestCase}
 */
proto.packs.DownloadPacksRequest.prototype.getRequestCase = function() {
  return /** @type {proto.packs.DownloadPacksRequest.RequestCase} */(jspb.Message.computeOneofCase(this, proto.packs.DownloadPacksRequest.oneofGroups_[0]));
};



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.DownloadPacksRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.DownloadPacksRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.DownloadPacksRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.DownloadPacksRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    all: jspb.Message.getBooleanFieldWithDefault(msg, 1, false),
    packList: (f = msg.getPackList()) && proto.packs.PackDownloadRequests.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.DownloadPacksRequest}
 */
proto.packs.DownloadPacksRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.DownloadPacksRequest;
  return proto.packs.DownloadPacksRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.DownloadPacksRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.DownloadPacksRequest}
 */
proto.packs.DownloadPacksRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setAll(value);
      break;
    case 2:
      var value = new proto.packs.PackDownloadRequests;
      reader.readMessage(value,proto.packs.PackDownloadRequests.deserializeBinaryFromReader);
      msg.setPackList(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.DownloadPacksRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.DownloadPacksRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.DownloadPacksRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.DownloadPacksRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = /** @type {boolean} */ (jspb.Message.getField(message, 1));
  if (f != null) {
    writer.writeBool(
      1,
      f
    );
  }
  f = message.getPackList();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.packs.PackDownloadRequests.serializeBinaryToWriter
    );
  }
};


/**
 * optional bool all = 1;
 * @return {boolean}
 */
proto.packs.DownloadPacksRequest.prototype.getAll = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 1, false));
};


/**
 * @param {boolean} value
 * @return {!proto.packs.DownloadPacksRequest} returns this
 */
proto.packs.DownloadPacksRequest.prototype.setAll = function(value) {
  return jspb.Message.setOneofField(this, 1, proto.packs.DownloadPacksRequest.oneofGroups_[0], value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.packs.DownloadPacksRequest} returns this
 */
proto.packs.DownloadPacksRequest.prototype.clearAll = function() {
  return jspb.Message.setOneofField(this, 1, proto.packs.DownloadPacksRequest.oneofGroups_[0], undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.DownloadPacksRequest.prototype.hasAll = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional PackDownloadRequests pack_list = 2;
 * @return {?proto.packs.PackDownloadRequests}
 */
proto.packs.DownloadPacksRequest.prototype.getPackList = function() {
  return /** @type{?proto.packs.PackDownloadRequests} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackDownloadRequests, 2));
};


/**
 * @param {?proto.packs.PackDownloadRequests|undefined} value
 * @return {!proto.packs.DownloadPacksRequest} returns this
*/
proto.packs.DownloadPacksRequest.prototype.setPackList = function(value) {
  return jspb.Message.setOneofWrapperField(this, 2, proto.packs.DownloadPacksRequest.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.DownloadPacksRequest} returns this
 */
proto.packs.DownloadPacksRequest.prototype.clearPackList = function() {
  return this.setPackList(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.DownloadPacksRequest.prototype.hasPackList = function() {
  return jspb.Message.getField(this, 2) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.DownloadResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.DownloadResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.DownloadResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.DownloadResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    type: jspb.Message.getFieldWithDefault(msg, 1, 0),
    packId: (f = msg.getPackId()) && proto.packs.PackId.toObject(includeInstance, f),
    result: jspb.Message.getFieldWithDefault(msg, 3, 0),
    message: jspb.Message.getFieldWithDefault(msg, 4, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.DownloadResponse}
 */
proto.packs.DownloadResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.DownloadResponse;
  return proto.packs.DownloadResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.DownloadResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.DownloadResponse}
 */
proto.packs.DownloadResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!proto.packs.DownloadResponse.Type} */ (reader.readEnum());
      msg.setType(value);
      break;
    case 2:
      var value = new proto.packs.PackId;
      reader.readMessage(value,proto.packs.PackId.deserializeBinaryFromReader);
      msg.setPackId(value);
      break;
    case 3:
      var value = /** @type {!proto.packs.DownloadResponse.Result} */ (reader.readEnum());
      msg.setResult(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setMessage(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.DownloadResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.DownloadResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.DownloadResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.DownloadResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getType();
  if (f !== 0.0) {
    writer.writeEnum(
      1,
      f
    );
  }
  f = message.getPackId();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.packs.PackId.serializeBinaryToWriter
    );
  }
  f = message.getResult();
  if (f !== 0.0) {
    writer.writeEnum(
      3,
      f
    );
  }
  f = message.getMessage();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
};


/**
 * @enum {number}
 */
proto.packs.DownloadResponse.Type = {
  PIDX: 0,
  PDSC: 1,
  PACK: 2
};

/**
 * @enum {number}
 */
proto.packs.DownloadResponse.Result = {
  SUCCESS: 0,
  FAILURE: 1,
  SKIPPED: 2
};

/**
 * optional Type type = 1;
 * @return {!proto.packs.DownloadResponse.Type}
 */
proto.packs.DownloadResponse.prototype.getType = function() {
  return /** @type {!proto.packs.DownloadResponse.Type} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {!proto.packs.DownloadResponse.Type} value
 * @return {!proto.packs.DownloadResponse} returns this
 */
proto.packs.DownloadResponse.prototype.setType = function(value) {
  return jspb.Message.setProto3EnumField(this, 1, value);
};


/**
 * optional PackId pack_id = 2;
 * @return {?proto.packs.PackId}
 */
proto.packs.DownloadResponse.prototype.getPackId = function() {
  return /** @type{?proto.packs.PackId} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackId, 2));
};


/**
 * @param {?proto.packs.PackId|undefined} value
 * @return {!proto.packs.DownloadResponse} returns this
*/
proto.packs.DownloadResponse.prototype.setPackId = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.DownloadResponse} returns this
 */
proto.packs.DownloadResponse.prototype.clearPackId = function() {
  return this.setPackId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.DownloadResponse.prototype.hasPackId = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional Result result = 3;
 * @return {!proto.packs.DownloadResponse.Result}
 */
proto.packs.DownloadResponse.prototype.getResult = function() {
  return /** @type {!proto.packs.DownloadResponse.Result} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {!proto.packs.DownloadResponse.Result} value
 * @return {!proto.packs.DownloadResponse} returns this
 */
proto.packs.DownloadResponse.prototype.setResult = function(value) {
  return jspb.Message.setProto3EnumField(this, 3, value);
};


/**
 * optional string message = 4;
 * @return {string}
 */
proto.packs.DownloadResponse.prototype.getMessage = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.DownloadResponse} returns this
 */
proto.packs.DownloadResponse.prototype.setMessage = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.CleanupRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.CleanupRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.CleanupRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.CleanupRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    dryRun: jspb.Message.getBooleanFieldWithDefault(msg, 1, false)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.CleanupRequest}
 */
proto.packs.CleanupRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.CleanupRequest;
  return proto.packs.CleanupRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.CleanupRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.CleanupRequest}
 */
proto.packs.CleanupRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setDryRun(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.CleanupRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.CleanupRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.CleanupRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.CleanupRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getDryRun();
  if (f) {
    writer.writeBool(
      1,
      f
    );
  }
};


/**
 * optional bool dry_run = 1;
 * @return {boolean}
 */
proto.packs.CleanupRequest.prototype.getDryRun = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 1, false));
};


/**
 * @param {boolean} value
 * @return {!proto.packs.CleanupRequest} returns this
 */
proto.packs.CleanupRequest.prototype.setDryRun = function(value) {
  return jspb.Message.setProto3BooleanField(this, 1, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.CleanupResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.CleanupResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.CleanupResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.CleanupResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    type: jspb.Message.getFieldWithDefault(msg, 1, 0),
    packId: (f = msg.getPackId()) && proto.packs.PackId.toObject(includeInstance, f),
    result: jspb.Message.getFieldWithDefault(msg, 3, 0),
    message: jspb.Message.getFieldWithDefault(msg, 4, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.CleanupResponse}
 */
proto.packs.CleanupResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.CleanupResponse;
  return proto.packs.CleanupResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.CleanupResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.CleanupResponse}
 */
proto.packs.CleanupResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!proto.packs.CleanupResponse.Type} */ (reader.readEnum());
      msg.setType(value);
      break;
    case 2:
      var value = new proto.packs.PackId;
      reader.readMessage(value,proto.packs.PackId.deserializeBinaryFromReader);
      msg.setPackId(value);
      break;
    case 3:
      var value = /** @type {!proto.packs.CleanupResponse.Result} */ (reader.readEnum());
      msg.setResult(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setMessage(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.CleanupResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.CleanupResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.CleanupResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.CleanupResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getType();
  if (f !== 0.0) {
    writer.writeEnum(
      1,
      f
    );
  }
  f = message.getPackId();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.packs.PackId.serializeBinaryToWriter
    );
  }
  f = message.getResult();
  if (f !== 0.0) {
    writer.writeEnum(
      3,
      f
    );
  }
  f = message.getMessage();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
};


/**
 * @enum {number}
 */
proto.packs.CleanupResponse.Type = {
  PIDX: 0,
  PDSC: 1,
  PACK: 2
};

/**
 * @enum {number}
 */
proto.packs.CleanupResponse.Result = {
  DELETED: 0,
  UNABLE_TO_DELETE: 1,
  SKIPPED: 2
};

/**
 * optional Type type = 1;
 * @return {!proto.packs.CleanupResponse.Type}
 */
proto.packs.CleanupResponse.prototype.getType = function() {
  return /** @type {!proto.packs.CleanupResponse.Type} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {!proto.packs.CleanupResponse.Type} value
 * @return {!proto.packs.CleanupResponse} returns this
 */
proto.packs.CleanupResponse.prototype.setType = function(value) {
  return jspb.Message.setProto3EnumField(this, 1, value);
};


/**
 * optional PackId pack_id = 2;
 * @return {?proto.packs.PackId}
 */
proto.packs.CleanupResponse.prototype.getPackId = function() {
  return /** @type{?proto.packs.PackId} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackId, 2));
};


/**
 * @param {?proto.packs.PackId|undefined} value
 * @return {!proto.packs.CleanupResponse} returns this
*/
proto.packs.CleanupResponse.prototype.setPackId = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.CleanupResponse} returns this
 */
proto.packs.CleanupResponse.prototype.clearPackId = function() {
  return this.setPackId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.CleanupResponse.prototype.hasPackId = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional Result result = 3;
 * @return {!proto.packs.CleanupResponse.Result}
 */
proto.packs.CleanupResponse.prototype.getResult = function() {
  return /** @type {!proto.packs.CleanupResponse.Result} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {!proto.packs.CleanupResponse.Result} value
 * @return {!proto.packs.CleanupResponse} returns this
 */
proto.packs.CleanupResponse.prototype.setResult = function(value) {
  return jspb.Message.setProto3EnumField(this, 3, value);
};


/**
 * optional string message = 4;
 * @return {string}
 */
proto.packs.CleanupResponse.prototype.getMessage = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.CleanupResponse} returns this
 */
proto.packs.CleanupResponse.prototype.setMessage = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.ListComponentsRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.ListComponentsRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.ListComponentsRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ListComponentsRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    targetOptions: (f = msg.getTargetOptions()) && proto.packs.TargetOptions.toObject(includeInstance, f),
    toolchainOptions: (f = msg.getToolchainOptions()) && proto.packs.ToolchainOptions.toObject(includeInstance, f),
    filter: (f = msg.getFilter()) && proto.packs.ComponentFilter.toObject(includeInstance, f),
    packScope: (f = msg.getPackScope()) && proto.packs.PackScope.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.ListComponentsRequest}
 */
proto.packs.ListComponentsRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.ListComponentsRequest;
  return proto.packs.ListComponentsRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.ListComponentsRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.ListComponentsRequest}
 */
proto.packs.ListComponentsRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.TargetOptions;
      reader.readMessage(value,proto.packs.TargetOptions.deserializeBinaryFromReader);
      msg.setTargetOptions(value);
      break;
    case 2:
      var value = new proto.packs.ToolchainOptions;
      reader.readMessage(value,proto.packs.ToolchainOptions.deserializeBinaryFromReader);
      msg.setToolchainOptions(value);
      break;
    case 3:
      var value = new proto.packs.ComponentFilter;
      reader.readMessage(value,proto.packs.ComponentFilter.deserializeBinaryFromReader);
      msg.setFilter(value);
      break;
    case 4:
      var value = new proto.packs.PackScope;
      reader.readMessage(value,proto.packs.PackScope.deserializeBinaryFromReader);
      msg.setPackScope(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.ListComponentsRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.ListComponentsRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.ListComponentsRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ListComponentsRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTargetOptions();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.packs.TargetOptions.serializeBinaryToWriter
    );
  }
  f = message.getToolchainOptions();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.packs.ToolchainOptions.serializeBinaryToWriter
    );
  }
  f = message.getFilter();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.packs.ComponentFilter.serializeBinaryToWriter
    );
  }
  f = message.getPackScope();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.packs.PackScope.serializeBinaryToWriter
    );
  }
};


/**
 * optional TargetOptions target_options = 1;
 * @return {?proto.packs.TargetOptions}
 */
proto.packs.ListComponentsRequest.prototype.getTargetOptions = function() {
  return /** @type{?proto.packs.TargetOptions} */ (
    jspb.Message.getWrapperField(this, proto.packs.TargetOptions, 1));
};


/**
 * @param {?proto.packs.TargetOptions|undefined} value
 * @return {!proto.packs.ListComponentsRequest} returns this
*/
proto.packs.ListComponentsRequest.prototype.setTargetOptions = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.ListComponentsRequest} returns this
 */
proto.packs.ListComponentsRequest.prototype.clearTargetOptions = function() {
  return this.setTargetOptions(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ListComponentsRequest.prototype.hasTargetOptions = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional ToolchainOptions toolchain_options = 2;
 * @return {?proto.packs.ToolchainOptions}
 */
proto.packs.ListComponentsRequest.prototype.getToolchainOptions = function() {
  return /** @type{?proto.packs.ToolchainOptions} */ (
    jspb.Message.getWrapperField(this, proto.packs.ToolchainOptions, 2));
};


/**
 * @param {?proto.packs.ToolchainOptions|undefined} value
 * @return {!proto.packs.ListComponentsRequest} returns this
*/
proto.packs.ListComponentsRequest.prototype.setToolchainOptions = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.ListComponentsRequest} returns this
 */
proto.packs.ListComponentsRequest.prototype.clearToolchainOptions = function() {
  return this.setToolchainOptions(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ListComponentsRequest.prototype.hasToolchainOptions = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional ComponentFilter filter = 3;
 * @return {?proto.packs.ComponentFilter}
 */
proto.packs.ListComponentsRequest.prototype.getFilter = function() {
  return /** @type{?proto.packs.ComponentFilter} */ (
    jspb.Message.getWrapperField(this, proto.packs.ComponentFilter, 3));
};


/**
 * @param {?proto.packs.ComponentFilter|undefined} value
 * @return {!proto.packs.ListComponentsRequest} returns this
*/
proto.packs.ListComponentsRequest.prototype.setFilter = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.ListComponentsRequest} returns this
 */
proto.packs.ListComponentsRequest.prototype.clearFilter = function() {
  return this.setFilter(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ListComponentsRequest.prototype.hasFilter = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional PackScope pack_scope = 4;
 * @return {?proto.packs.PackScope}
 */
proto.packs.ListComponentsRequest.prototype.getPackScope = function() {
  return /** @type{?proto.packs.PackScope} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackScope, 4));
};


/**
 * @param {?proto.packs.PackScope|undefined} value
 * @return {!proto.packs.ListComponentsRequest} returns this
*/
proto.packs.ListComponentsRequest.prototype.setPackScope = function(value) {
  return jspb.Message.setWrapperField(this, 4, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.ListComponentsRequest} returns this
 */
proto.packs.ListComponentsRequest.prototype.clearPackScope = function() {
  return this.setPackScope(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ListComponentsRequest.prototype.hasPackScope = function() {
  return jspb.Message.getField(this, 4) != null;
};



/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.packs.PackScope.oneofGroups_ = [[1,2]];

/**
 * @enum {number}
 */
proto.packs.PackScope.PackScopeCase = {
  PACK_SCOPE_NOT_SET: 0,
  PACK_SCOPE_PRESET: 1,
  PACK_IDS: 2
};

/**
 * @return {proto.packs.PackScope.PackScopeCase}
 */
proto.packs.PackScope.prototype.getPackScopeCase = function() {
  return /** @type {proto.packs.PackScope.PackScopeCase} */(jspb.Message.computeOneofCase(this, proto.packs.PackScope.oneofGroups_[0]));
};



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.PackScope.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.PackScope.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.PackScope} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.PackScope.toObject = function(includeInstance, msg) {
  var f, obj = {
    packScopePreset: jspb.Message.getFieldWithDefault(msg, 1, 0),
    packIds: (f = msg.getPackIds()) && proto.packs.PackIds.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.PackScope}
 */
proto.packs.PackScope.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.PackScope;
  return proto.packs.PackScope.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.PackScope} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.PackScope}
 */
proto.packs.PackScope.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!proto.packs.PackScopePreset} */ (reader.readEnum());
      msg.setPackScopePreset(value);
      break;
    case 2:
      var value = new proto.packs.PackIds;
      reader.readMessage(value,proto.packs.PackIds.deserializeBinaryFromReader);
      msg.setPackIds(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.PackScope.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.PackScope.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.PackScope} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.PackScope.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = /** @type {!proto.packs.PackScopePreset} */ (jspb.Message.getField(message, 1));
  if (f != null) {
    writer.writeEnum(
      1,
      f
    );
  }
  f = message.getPackIds();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.packs.PackIds.serializeBinaryToWriter
    );
  }
};


/**
 * optional PackScopePreset pack_scope_preset = 1;
 * @return {!proto.packs.PackScopePreset}
 */
proto.packs.PackScope.prototype.getPackScopePreset = function() {
  return /** @type {!proto.packs.PackScopePreset} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {!proto.packs.PackScopePreset} value
 * @return {!proto.packs.PackScope} returns this
 */
proto.packs.PackScope.prototype.setPackScopePreset = function(value) {
  return jspb.Message.setOneofField(this, 1, proto.packs.PackScope.oneofGroups_[0], value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.packs.PackScope} returns this
 */
proto.packs.PackScope.prototype.clearPackScopePreset = function() {
  return jspb.Message.setOneofField(this, 1, proto.packs.PackScope.oneofGroups_[0], undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.PackScope.prototype.hasPackScopePreset = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional PackIds pack_ids = 2;
 * @return {?proto.packs.PackIds}
 */
proto.packs.PackScope.prototype.getPackIds = function() {
  return /** @type{?proto.packs.PackIds} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackIds, 2));
};


/**
 * @param {?proto.packs.PackIds|undefined} value
 * @return {!proto.packs.PackScope} returns this
*/
proto.packs.PackScope.prototype.setPackIds = function(value) {
  return jspb.Message.setOneofWrapperField(this, 2, proto.packs.PackScope.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.PackScope} returns this
 */
proto.packs.PackScope.prototype.clearPackIds = function() {
  return this.setPackIds(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.PackScope.prototype.hasPackIds = function() {
  return jspb.Message.getField(this, 2) != null;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.packs.PackIds.repeatedFields_ = [1];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.PackIds.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.PackIds.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.PackIds} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.PackIds.toObject = function(includeInstance, msg) {
  var f, obj = {
    packIdsList: jspb.Message.toObjectList(msg.getPackIdsList(),
    proto.packs.PackId.toObject, includeInstance)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.PackIds}
 */
proto.packs.PackIds.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.PackIds;
  return proto.packs.PackIds.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.PackIds} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.PackIds}
 */
proto.packs.PackIds.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.PackId;
      reader.readMessage(value,proto.packs.PackId.deserializeBinaryFromReader);
      msg.addPackIds(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.PackIds.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.PackIds.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.PackIds} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.PackIds.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPackIdsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.packs.PackId.serializeBinaryToWriter
    );
  }
};


/**
 * repeated PackId pack_ids = 1;
 * @return {!Array<!proto.packs.PackId>}
 */
proto.packs.PackIds.prototype.getPackIdsList = function() {
  return /** @type{!Array<!proto.packs.PackId>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.packs.PackId, 1));
};


/**
 * @param {!Array<!proto.packs.PackId>} value
 * @return {!proto.packs.PackIds} returns this
*/
proto.packs.PackIds.prototype.setPackIdsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.packs.PackId=} opt_value
 * @param {number=} opt_index
 * @return {!proto.packs.PackId}
 */
proto.packs.PackIds.prototype.addPackIds = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.packs.PackId, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.PackIds} returns this
 */
proto.packs.PackIds.prototype.clearPackIdsList = function() {
  return this.setPackIdsList([]);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.ListBoardsRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.ListBoardsRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.ListBoardsRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ListBoardsRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    includeDeprecated: jspb.Message.getBooleanFieldWithDefault(msg, 1, false),
    filter: (f = msg.getFilter()) && proto.packs.BoardFilter.toObject(includeInstance, f),
    packScopePreset: jspb.Message.getFieldWithDefault(msg, 3, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.ListBoardsRequest}
 */
proto.packs.ListBoardsRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.ListBoardsRequest;
  return proto.packs.ListBoardsRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.ListBoardsRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.ListBoardsRequest}
 */
proto.packs.ListBoardsRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setIncludeDeprecated(value);
      break;
    case 2:
      var value = new proto.packs.BoardFilter;
      reader.readMessage(value,proto.packs.BoardFilter.deserializeBinaryFromReader);
      msg.setFilter(value);
      break;
    case 3:
      var value = /** @type {!proto.packs.PackScopePreset} */ (reader.readEnum());
      msg.setPackScopePreset(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.ListBoardsRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.ListBoardsRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.ListBoardsRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ListBoardsRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getIncludeDeprecated();
  if (f) {
    writer.writeBool(
      1,
      f
    );
  }
  f = message.getFilter();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.packs.BoardFilter.serializeBinaryToWriter
    );
  }
  f = message.getPackScopePreset();
  if (f !== 0.0) {
    writer.writeEnum(
      3,
      f
    );
  }
};


/**
 * optional bool include_deprecated = 1;
 * @return {boolean}
 */
proto.packs.ListBoardsRequest.prototype.getIncludeDeprecated = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 1, false));
};


/**
 * @param {boolean} value
 * @return {!proto.packs.ListBoardsRequest} returns this
 */
proto.packs.ListBoardsRequest.prototype.setIncludeDeprecated = function(value) {
  return jspb.Message.setProto3BooleanField(this, 1, value);
};


/**
 * optional BoardFilter filter = 2;
 * @return {?proto.packs.BoardFilter}
 */
proto.packs.ListBoardsRequest.prototype.getFilter = function() {
  return /** @type{?proto.packs.BoardFilter} */ (
    jspb.Message.getWrapperField(this, proto.packs.BoardFilter, 2));
};


/**
 * @param {?proto.packs.BoardFilter|undefined} value
 * @return {!proto.packs.ListBoardsRequest} returns this
*/
proto.packs.ListBoardsRequest.prototype.setFilter = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.ListBoardsRequest} returns this
 */
proto.packs.ListBoardsRequest.prototype.clearFilter = function() {
  return this.setFilter(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ListBoardsRequest.prototype.hasFilter = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional PackScopePreset pack_scope_preset = 3;
 * @return {!proto.packs.PackScopePreset}
 */
proto.packs.ListBoardsRequest.prototype.getPackScopePreset = function() {
  return /** @type {!proto.packs.PackScopePreset} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {!proto.packs.PackScopePreset} value
 * @return {!proto.packs.ListBoardsRequest} returns this
 */
proto.packs.ListBoardsRequest.prototype.setPackScopePreset = function(value) {
  return jspb.Message.setProto3EnumField(this, 3, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.GetBoardRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.GetBoardRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.GetBoardRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.GetBoardRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: (f = msg.getId()) && proto.packs.BoardId.toObject(includeInstance, f),
    packScopePreset: jspb.Message.getFieldWithDefault(msg, 2, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.GetBoardRequest}
 */
proto.packs.GetBoardRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.GetBoardRequest;
  return proto.packs.GetBoardRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.GetBoardRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.GetBoardRequest}
 */
proto.packs.GetBoardRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.BoardId;
      reader.readMessage(value,proto.packs.BoardId.deserializeBinaryFromReader);
      msg.setId(value);
      break;
    case 2:
      var value = /** @type {!proto.packs.PackScopePreset} */ (reader.readEnum());
      msg.setPackScopePreset(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.GetBoardRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.GetBoardRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.GetBoardRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.GetBoardRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.packs.BoardId.serializeBinaryToWriter
    );
  }
  f = message.getPackScopePreset();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
};


/**
 * optional BoardId id = 1;
 * @return {?proto.packs.BoardId}
 */
proto.packs.GetBoardRequest.prototype.getId = function() {
  return /** @type{?proto.packs.BoardId} */ (
    jspb.Message.getWrapperField(this, proto.packs.BoardId, 1));
};


/**
 * @param {?proto.packs.BoardId|undefined} value
 * @return {!proto.packs.GetBoardRequest} returns this
*/
proto.packs.GetBoardRequest.prototype.setId = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.GetBoardRequest} returns this
 */
proto.packs.GetBoardRequest.prototype.clearId = function() {
  return this.setId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.GetBoardRequest.prototype.hasId = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional PackScopePreset pack_scope_preset = 2;
 * @return {!proto.packs.PackScopePreset}
 */
proto.packs.GetBoardRequest.prototype.getPackScopePreset = function() {
  return /** @type {!proto.packs.PackScopePreset} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.packs.PackScopePreset} value
 * @return {!proto.packs.GetBoardRequest} returns this
 */
proto.packs.GetBoardRequest.prototype.setPackScopePreset = function(value) {
  return jspb.Message.setProto3EnumField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.ListDevicesRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.ListDevicesRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.ListDevicesRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ListDevicesRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    packScopePreset: jspb.Message.getFieldWithDefault(msg, 1, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.ListDevicesRequest}
 */
proto.packs.ListDevicesRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.ListDevicesRequest;
  return proto.packs.ListDevicesRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.ListDevicesRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.ListDevicesRequest}
 */
proto.packs.ListDevicesRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!proto.packs.PackScopePreset} */ (reader.readEnum());
      msg.setPackScopePreset(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.ListDevicesRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.ListDevicesRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.ListDevicesRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ListDevicesRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPackScopePreset();
  if (f !== 0.0) {
    writer.writeEnum(
      1,
      f
    );
  }
};


/**
 * optional PackScopePreset pack_scope_preset = 1;
 * @return {!proto.packs.PackScopePreset}
 */
proto.packs.ListDevicesRequest.prototype.getPackScopePreset = function() {
  return /** @type {!proto.packs.PackScopePreset} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {!proto.packs.PackScopePreset} value
 * @return {!proto.packs.ListDevicesRequest} returns this
 */
proto.packs.ListDevicesRequest.prototype.setPackScopePreset = function(value) {
  return jspb.Message.setProto3EnumField(this, 1, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.GetDeviceEntryRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.GetDeviceEntryRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.GetDeviceEntryRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.GetDeviceEntryRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    reference: (f = msg.getReference()) && proto.packs.DeviceReference.toObject(includeInstance, f),
    packScopePreset: jspb.Message.getFieldWithDefault(msg, 2, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.GetDeviceEntryRequest}
 */
proto.packs.GetDeviceEntryRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.GetDeviceEntryRequest;
  return proto.packs.GetDeviceEntryRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.GetDeviceEntryRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.GetDeviceEntryRequest}
 */
proto.packs.GetDeviceEntryRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.DeviceReference;
      reader.readMessage(value,proto.packs.DeviceReference.deserializeBinaryFromReader);
      msg.setReference(value);
      break;
    case 2:
      var value = /** @type {!proto.packs.PackScopePreset} */ (reader.readEnum());
      msg.setPackScopePreset(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.GetDeviceEntryRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.GetDeviceEntryRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.GetDeviceEntryRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.GetDeviceEntryRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getReference();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.packs.DeviceReference.serializeBinaryToWriter
    );
  }
  f = message.getPackScopePreset();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
};


/**
 * optional DeviceReference reference = 1;
 * @return {?proto.packs.DeviceReference}
 */
proto.packs.GetDeviceEntryRequest.prototype.getReference = function() {
  return /** @type{?proto.packs.DeviceReference} */ (
    jspb.Message.getWrapperField(this, proto.packs.DeviceReference, 1));
};


/**
 * @param {?proto.packs.DeviceReference|undefined} value
 * @return {!proto.packs.GetDeviceEntryRequest} returns this
*/
proto.packs.GetDeviceEntryRequest.prototype.setReference = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.GetDeviceEntryRequest} returns this
 */
proto.packs.GetDeviceEntryRequest.prototype.clearReference = function() {
  return this.setReference(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.GetDeviceEntryRequest.prototype.hasReference = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional PackScopePreset pack_scope_preset = 2;
 * @return {!proto.packs.PackScopePreset}
 */
proto.packs.GetDeviceEntryRequest.prototype.getPackScopePreset = function() {
  return /** @type {!proto.packs.PackScopePreset} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.packs.PackScopePreset} value
 * @return {!proto.packs.GetDeviceEntryRequest} returns this
 */
proto.packs.GetDeviceEntryRequest.prototype.setPackScopePreset = function(value) {
  return jspb.Message.setProto3EnumField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.GetExampleRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.GetExampleRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.GetExampleRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.GetExampleRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: (f = msg.getId()) && proto.packs.ExampleId.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.GetExampleRequest}
 */
proto.packs.GetExampleRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.GetExampleRequest;
  return proto.packs.GetExampleRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.GetExampleRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.GetExampleRequest}
 */
proto.packs.GetExampleRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.ExampleId;
      reader.readMessage(value,proto.packs.ExampleId.deserializeBinaryFromReader);
      msg.setId(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.GetExampleRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.GetExampleRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.GetExampleRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.GetExampleRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.packs.ExampleId.serializeBinaryToWriter
    );
  }
};


/**
 * optional ExampleId id = 1;
 * @return {?proto.packs.ExampleId}
 */
proto.packs.GetExampleRequest.prototype.getId = function() {
  return /** @type{?proto.packs.ExampleId} */ (
    jspb.Message.getWrapperField(this, proto.packs.ExampleId, 1));
};


/**
 * @param {?proto.packs.ExampleId|undefined} value
 * @return {!proto.packs.GetExampleRequest} returns this
*/
proto.packs.GetExampleRequest.prototype.setId = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.GetExampleRequest} returns this
 */
proto.packs.GetExampleRequest.prototype.clearId = function() {
  return this.setId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.GetExampleRequest.prototype.hasId = function() {
  return jspb.Message.getField(this, 1) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.ListRefAppsRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.ListRefAppsRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.ListRefAppsRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ListRefAppsRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    filter: (f = msg.getFilter()) && proto.packs.BoardFilter.toObject(includeInstance, f),
    packScopePreset: jspb.Message.getFieldWithDefault(msg, 2, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.ListRefAppsRequest}
 */
proto.packs.ListRefAppsRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.ListRefAppsRequest;
  return proto.packs.ListRefAppsRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.ListRefAppsRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.ListRefAppsRequest}
 */
proto.packs.ListRefAppsRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.BoardFilter;
      reader.readMessage(value,proto.packs.BoardFilter.deserializeBinaryFromReader);
      msg.setFilter(value);
      break;
    case 2:
      var value = /** @type {!proto.packs.PackScopePreset} */ (reader.readEnum());
      msg.setPackScopePreset(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.ListRefAppsRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.ListRefAppsRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.ListRefAppsRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ListRefAppsRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getFilter();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.packs.BoardFilter.serializeBinaryToWriter
    );
  }
  f = message.getPackScopePreset();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
};


/**
 * optional BoardFilter filter = 1;
 * @return {?proto.packs.BoardFilter}
 */
proto.packs.ListRefAppsRequest.prototype.getFilter = function() {
  return /** @type{?proto.packs.BoardFilter} */ (
    jspb.Message.getWrapperField(this, proto.packs.BoardFilter, 1));
};


/**
 * @param {?proto.packs.BoardFilter|undefined} value
 * @return {!proto.packs.ListRefAppsRequest} returns this
*/
proto.packs.ListRefAppsRequest.prototype.setFilter = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.ListRefAppsRequest} returns this
 */
proto.packs.ListRefAppsRequest.prototype.clearFilter = function() {
  return this.setFilter(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ListRefAppsRequest.prototype.hasFilter = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional PackScopePreset pack_scope_preset = 2;
 * @return {!proto.packs.PackScopePreset}
 */
proto.packs.ListRefAppsRequest.prototype.getPackScopePreset = function() {
  return /** @type {!proto.packs.PackScopePreset} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.packs.PackScopePreset} value
 * @return {!proto.packs.ListRefAppsRequest} returns this
 */
proto.packs.ListRefAppsRequest.prototype.setPackScopePreset = function(value) {
  return jspb.Message.setProto3EnumField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.ListTemplatesRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.ListTemplatesRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.ListTemplatesRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ListTemplatesRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    board: (f = msg.getBoard()) && proto.packs.BoardConstraints.toObject(includeInstance, f),
    device: (f = msg.getDevice()) && proto.packs.DeviceConstraints.toObject(includeInstance, f),
    packScopePreset: jspb.Message.getFieldWithDefault(msg, 3, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.ListTemplatesRequest}
 */
proto.packs.ListTemplatesRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.ListTemplatesRequest;
  return proto.packs.ListTemplatesRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.ListTemplatesRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.ListTemplatesRequest}
 */
proto.packs.ListTemplatesRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.BoardConstraints;
      reader.readMessage(value,proto.packs.BoardConstraints.deserializeBinaryFromReader);
      msg.setBoard(value);
      break;
    case 2:
      var value = new proto.packs.DeviceConstraints;
      reader.readMessage(value,proto.packs.DeviceConstraints.deserializeBinaryFromReader);
      msg.setDevice(value);
      break;
    case 3:
      var value = /** @type {!proto.packs.PackScopePreset} */ (reader.readEnum());
      msg.setPackScopePreset(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.ListTemplatesRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.ListTemplatesRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.ListTemplatesRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ListTemplatesRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBoard();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.packs.BoardConstraints.serializeBinaryToWriter
    );
  }
  f = message.getDevice();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.packs.DeviceConstraints.serializeBinaryToWriter
    );
  }
  f = message.getPackScopePreset();
  if (f !== 0.0) {
    writer.writeEnum(
      3,
      f
    );
  }
};


/**
 * optional BoardConstraints board = 1;
 * @return {?proto.packs.BoardConstraints}
 */
proto.packs.ListTemplatesRequest.prototype.getBoard = function() {
  return /** @type{?proto.packs.BoardConstraints} */ (
    jspb.Message.getWrapperField(this, proto.packs.BoardConstraints, 1));
};


/**
 * @param {?proto.packs.BoardConstraints|undefined} value
 * @return {!proto.packs.ListTemplatesRequest} returns this
*/
proto.packs.ListTemplatesRequest.prototype.setBoard = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.ListTemplatesRequest} returns this
 */
proto.packs.ListTemplatesRequest.prototype.clearBoard = function() {
  return this.setBoard(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ListTemplatesRequest.prototype.hasBoard = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional DeviceConstraints device = 2;
 * @return {?proto.packs.DeviceConstraints}
 */
proto.packs.ListTemplatesRequest.prototype.getDevice = function() {
  return /** @type{?proto.packs.DeviceConstraints} */ (
    jspb.Message.getWrapperField(this, proto.packs.DeviceConstraints, 2));
};


/**
 * @param {?proto.packs.DeviceConstraints|undefined} value
 * @return {!proto.packs.ListTemplatesRequest} returns this
*/
proto.packs.ListTemplatesRequest.prototype.setDevice = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.ListTemplatesRequest} returns this
 */
proto.packs.ListTemplatesRequest.prototype.clearDevice = function() {
  return this.setDevice(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ListTemplatesRequest.prototype.hasDevice = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional PackScopePreset pack_scope_preset = 3;
 * @return {!proto.packs.PackScopePreset}
 */
proto.packs.ListTemplatesRequest.prototype.getPackScopePreset = function() {
  return /** @type {!proto.packs.PackScopePreset} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {!proto.packs.PackScopePreset} value
 * @return {!proto.packs.ListTemplatesRequest} returns this
 */
proto.packs.ListTemplatesRequest.prototype.setPackScopePreset = function(value) {
  return jspb.Message.setProto3EnumField(this, 3, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.ServiceVersion.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.ServiceVersion.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.ServiceVersion} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ServiceVersion.toObject = function(includeInstance, msg) {
  var f, obj = {
    version: jspb.Message.getFieldWithDefault(msg, 1, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.ServiceVersion}
 */
proto.packs.ServiceVersion.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.ServiceVersion;
  return proto.packs.ServiceVersion.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.ServiceVersion} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.ServiceVersion}
 */
proto.packs.ServiceVersion.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setVersion(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.ServiceVersion.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.ServiceVersion.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.ServiceVersion} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ServiceVersion.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getVersion();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
};


/**
 * optional string version = 1;
 * @return {string}
 */
proto.packs.ServiceVersion.prototype.getVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.ServiceVersion} returns this
 */
proto.packs.ServiceVersion.prototype.setVersion = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.CacheInitialisationStatus.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.CacheInitialisationStatus.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.CacheInitialisationStatus} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.CacheInitialisationStatus.toObject = function(includeInstance, msg) {
  var f, obj = {
    initialised: jspb.Message.getBooleanFieldWithDefault(msg, 1, false)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.CacheInitialisationStatus}
 */
proto.packs.CacheInitialisationStatus.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.CacheInitialisationStatus;
  return proto.packs.CacheInitialisationStatus.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.CacheInitialisationStatus} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.CacheInitialisationStatus}
 */
proto.packs.CacheInitialisationStatus.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setInitialised(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.CacheInitialisationStatus.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.CacheInitialisationStatus.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.CacheInitialisationStatus} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.CacheInitialisationStatus.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getInitialised();
  if (f) {
    writer.writeBool(
      1,
      f
    );
  }
};


/**
 * optional bool initialised = 1;
 * @return {boolean}
 */
proto.packs.CacheInitialisationStatus.prototype.getInitialised = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 1, false));
};


/**
 * @param {boolean} value
 * @return {!proto.packs.CacheInitialisationStatus} returns this
 */
proto.packs.CacheInitialisationStatus.prototype.setInitialised = function(value) {
  return jspb.Message.setProto3BooleanField(this, 1, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.packs.CacheStatus.repeatedFields_ = [2];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.CacheStatus.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.CacheStatus.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.CacheStatus} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.CacheStatus.toObject = function(includeInstance, msg) {
  var f, obj = {
    indexStatus: (f = msg.getIndexStatus()) && proto.packs.IndexStatus.toObject(includeInstance, f),
    packStatusList: jspb.Message.toObjectList(msg.getPackStatusList(),
    proto.packs.PackStatus.toObject, includeInstance),
    modTime: (f = msg.getModTime()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.CacheStatus}
 */
proto.packs.CacheStatus.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.CacheStatus;
  return proto.packs.CacheStatus.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.CacheStatus} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.CacheStatus}
 */
proto.packs.CacheStatus.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.IndexStatus;
      reader.readMessage(value,proto.packs.IndexStatus.deserializeBinaryFromReader);
      msg.setIndexStatus(value);
      break;
    case 2:
      var value = new proto.packs.PackStatus;
      reader.readMessage(value,proto.packs.PackStatus.deserializeBinaryFromReader);
      msg.addPackStatus(value);
      break;
    case 3:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setModTime(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.CacheStatus.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.CacheStatus.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.CacheStatus} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.CacheStatus.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getIndexStatus();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.packs.IndexStatus.serializeBinaryToWriter
    );
  }
  f = message.getPackStatusList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      2,
      f,
      proto.packs.PackStatus.serializeBinaryToWriter
    );
  }
  f = message.getModTime();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
};


/**
 * optional IndexStatus index_status = 1;
 * @return {?proto.packs.IndexStatus}
 */
proto.packs.CacheStatus.prototype.getIndexStatus = function() {
  return /** @type{?proto.packs.IndexStatus} */ (
    jspb.Message.getWrapperField(this, proto.packs.IndexStatus, 1));
};


/**
 * @param {?proto.packs.IndexStatus|undefined} value
 * @return {!proto.packs.CacheStatus} returns this
*/
proto.packs.CacheStatus.prototype.setIndexStatus = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.CacheStatus} returns this
 */
proto.packs.CacheStatus.prototype.clearIndexStatus = function() {
  return this.setIndexStatus(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.CacheStatus.prototype.hasIndexStatus = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * repeated PackStatus pack_status = 2;
 * @return {!Array<!proto.packs.PackStatus>}
 */
proto.packs.CacheStatus.prototype.getPackStatusList = function() {
  return /** @type{!Array<!proto.packs.PackStatus>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.packs.PackStatus, 2));
};


/**
 * @param {!Array<!proto.packs.PackStatus>} value
 * @return {!proto.packs.CacheStatus} returns this
*/
proto.packs.CacheStatus.prototype.setPackStatusList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 2, value);
};


/**
 * @param {!proto.packs.PackStatus=} opt_value
 * @param {number=} opt_index
 * @return {!proto.packs.PackStatus}
 */
proto.packs.CacheStatus.prototype.addPackStatus = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 2, opt_value, proto.packs.PackStatus, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.CacheStatus} returns this
 */
proto.packs.CacheStatus.prototype.clearPackStatusList = function() {
  return this.setPackStatusList([]);
};


/**
 * optional google.protobuf.Timestamp mod_time = 3;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.packs.CacheStatus.prototype.getModTime = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 3));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.packs.CacheStatus} returns this
*/
proto.packs.CacheStatus.prototype.setModTime = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.CacheStatus} returns this
 */
proto.packs.CacheStatus.prototype.clearModTime = function() {
  return this.setModTime(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.CacheStatus.prototype.hasModTime = function() {
  return jspb.Message.getField(this, 3) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.IndexStatus.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.IndexStatus.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.IndexStatus} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.IndexStatus.toObject = function(includeInstance, msg) {
  var f, obj = {
    indexTimestamp: (f = msg.getIndexTimestamp()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    packFamilyCount: jspb.Message.getFieldWithDefault(msg, 2, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.IndexStatus}
 */
proto.packs.IndexStatus.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.IndexStatus;
  return proto.packs.IndexStatus.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.IndexStatus} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.IndexStatus}
 */
proto.packs.IndexStatus.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setIndexTimestamp(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint64());
      msg.setPackFamilyCount(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.IndexStatus.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.IndexStatus.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.IndexStatus} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.IndexStatus.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getIndexTimestamp();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getPackFamilyCount();
  if (f !== 0) {
    writer.writeUint64(
      2,
      f
    );
  }
};


/**
 * optional google.protobuf.Timestamp index_timestamp = 1;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.packs.IndexStatus.prototype.getIndexTimestamp = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 1));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.packs.IndexStatus} returns this
*/
proto.packs.IndexStatus.prototype.setIndexTimestamp = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.IndexStatus} returns this
 */
proto.packs.IndexStatus.prototype.clearIndexTimestamp = function() {
  return this.setIndexTimestamp(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.IndexStatus.prototype.hasIndexTimestamp = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional uint64 pack_family_count = 2;
 * @return {number}
 */
proto.packs.IndexStatus.prototype.getPackFamilyCount = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {number} value
 * @return {!proto.packs.IndexStatus} returns this
 */
proto.packs.IndexStatus.prototype.setPackFamilyCount = function(value) {
  return jspb.Message.setProto3IntField(this, 2, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.packs.PackStatus.repeatedFields_ = [8,9,10,11];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.PackStatus.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.PackStatus.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.PackStatus} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.PackStatus.toObject = function(includeInstance, msg) {
  var f, obj = {
    name: jspb.Message.getFieldWithDefault(msg, 1, ""),
    vendor: jspb.Message.getFieldWithDefault(msg, 2, ""),
    currentVersion: jspb.Message.getFieldWithDefault(msg, 3, ""),
    latestVersion: jspb.Message.getFieldWithDefault(msg, 4, ""),
    allVersionsInstalled: jspb.Message.getBooleanFieldWithDefault(msg, 5, false),
    currentVersionInstalled: jspb.Message.getBooleanFieldWithDefault(msg, 6, false),
    anyVersionInstalled: jspb.Message.getBooleanFieldWithDefault(msg, 7, false),
    expectedVersionsList: (f = jspb.Message.getRepeatedField(msg, 8)) == null ? undefined : f,
    installedVersionsList: (f = jspb.Message.getRepeatedField(msg, 9)) == null ? undefined : f,
    missingVersionsList: (f = jspb.Message.getRepeatedField(msg, 10)) == null ? undefined : f,
    unlistedVersionsList: (f = jspb.Message.getRepeatedField(msg, 11)) == null ? undefined : f,
    unlistedPackFamily: jspb.Message.getBooleanFieldWithDefault(msg, 12, false),
    deprecatedPackFamily: jspb.Message.getBooleanFieldWithDefault(msg, 13, false),
    incompleteVersionInformation: jspb.Message.getBooleanFieldWithDefault(msg, 14, false)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.PackStatus}
 */
proto.packs.PackStatus.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.PackStatus;
  return proto.packs.PackStatus.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.PackStatus} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.PackStatus}
 */
proto.packs.PackStatus.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setName(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setVendor(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setCurrentVersion(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setLatestVersion(value);
      break;
    case 5:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setAllVersionsInstalled(value);
      break;
    case 6:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setCurrentVersionInstalled(value);
      break;
    case 7:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setAnyVersionInstalled(value);
      break;
    case 8:
      var value = /** @type {string} */ (reader.readString());
      msg.addExpectedVersions(value);
      break;
    case 9:
      var value = /** @type {string} */ (reader.readString());
      msg.addInstalledVersions(value);
      break;
    case 10:
      var value = /** @type {string} */ (reader.readString());
      msg.addMissingVersions(value);
      break;
    case 11:
      var value = /** @type {string} */ (reader.readString());
      msg.addUnlistedVersions(value);
      break;
    case 12:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setUnlistedPackFamily(value);
      break;
    case 13:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setDeprecatedPackFamily(value);
      break;
    case 14:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setIncompleteVersionInformation(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.PackStatus.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.PackStatus.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.PackStatus} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.PackStatus.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getName();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getVendor();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getCurrentVersion();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getLatestVersion();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getAllVersionsInstalled();
  if (f) {
    writer.writeBool(
      5,
      f
    );
  }
  f = message.getCurrentVersionInstalled();
  if (f) {
    writer.writeBool(
      6,
      f
    );
  }
  f = message.getAnyVersionInstalled();
  if (f) {
    writer.writeBool(
      7,
      f
    );
  }
  f = message.getExpectedVersionsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      8,
      f
    );
  }
  f = message.getInstalledVersionsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      9,
      f
    );
  }
  f = message.getMissingVersionsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      10,
      f
    );
  }
  f = message.getUnlistedVersionsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      11,
      f
    );
  }
  f = message.getUnlistedPackFamily();
  if (f) {
    writer.writeBool(
      12,
      f
    );
  }
  f = message.getDeprecatedPackFamily();
  if (f) {
    writer.writeBool(
      13,
      f
    );
  }
  f = message.getIncompleteVersionInformation();
  if (f) {
    writer.writeBool(
      14,
      f
    );
  }
};


/**
 * optional string name = 1;
 * @return {string}
 */
proto.packs.PackStatus.prototype.getName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.PackStatus} returns this
 */
proto.packs.PackStatus.prototype.setName = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string vendor = 2;
 * @return {string}
 */
proto.packs.PackStatus.prototype.getVendor = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.PackStatus} returns this
 */
proto.packs.PackStatus.prototype.setVendor = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string current_version = 3;
 * @return {string}
 */
proto.packs.PackStatus.prototype.getCurrentVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.PackStatus} returns this
 */
proto.packs.PackStatus.prototype.setCurrentVersion = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string latest_version = 4;
 * @return {string}
 */
proto.packs.PackStatus.prototype.getLatestVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.PackStatus} returns this
 */
proto.packs.PackStatus.prototype.setLatestVersion = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional bool all_versions_installed = 5;
 * @return {boolean}
 */
proto.packs.PackStatus.prototype.getAllVersionsInstalled = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 5, false));
};


/**
 * @param {boolean} value
 * @return {!proto.packs.PackStatus} returns this
 */
proto.packs.PackStatus.prototype.setAllVersionsInstalled = function(value) {
  return jspb.Message.setProto3BooleanField(this, 5, value);
};


/**
 * optional bool current_version_installed = 6;
 * @return {boolean}
 */
proto.packs.PackStatus.prototype.getCurrentVersionInstalled = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 6, false));
};


/**
 * @param {boolean} value
 * @return {!proto.packs.PackStatus} returns this
 */
proto.packs.PackStatus.prototype.setCurrentVersionInstalled = function(value) {
  return jspb.Message.setProto3BooleanField(this, 6, value);
};


/**
 * optional bool any_version_installed = 7;
 * @return {boolean}
 */
proto.packs.PackStatus.prototype.getAnyVersionInstalled = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 7, false));
};


/**
 * @param {boolean} value
 * @return {!proto.packs.PackStatus} returns this
 */
proto.packs.PackStatus.prototype.setAnyVersionInstalled = function(value) {
  return jspb.Message.setProto3BooleanField(this, 7, value);
};


/**
 * repeated string expected_versions = 8;
 * @return {!Array<string>}
 */
proto.packs.PackStatus.prototype.getExpectedVersionsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 8));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.packs.PackStatus} returns this
 */
proto.packs.PackStatus.prototype.setExpectedVersionsList = function(value) {
  return jspb.Message.setField(this, 8, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.packs.PackStatus} returns this
 */
proto.packs.PackStatus.prototype.addExpectedVersions = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 8, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.PackStatus} returns this
 */
proto.packs.PackStatus.prototype.clearExpectedVersionsList = function() {
  return this.setExpectedVersionsList([]);
};


/**
 * repeated string installed_versions = 9;
 * @return {!Array<string>}
 */
proto.packs.PackStatus.prototype.getInstalledVersionsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 9));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.packs.PackStatus} returns this
 */
proto.packs.PackStatus.prototype.setInstalledVersionsList = function(value) {
  return jspb.Message.setField(this, 9, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.packs.PackStatus} returns this
 */
proto.packs.PackStatus.prototype.addInstalledVersions = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 9, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.PackStatus} returns this
 */
proto.packs.PackStatus.prototype.clearInstalledVersionsList = function() {
  return this.setInstalledVersionsList([]);
};


/**
 * repeated string missing_versions = 10;
 * @return {!Array<string>}
 */
proto.packs.PackStatus.prototype.getMissingVersionsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 10));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.packs.PackStatus} returns this
 */
proto.packs.PackStatus.prototype.setMissingVersionsList = function(value) {
  return jspb.Message.setField(this, 10, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.packs.PackStatus} returns this
 */
proto.packs.PackStatus.prototype.addMissingVersions = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 10, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.PackStatus} returns this
 */
proto.packs.PackStatus.prototype.clearMissingVersionsList = function() {
  return this.setMissingVersionsList([]);
};


/**
 * repeated string unlisted_versions = 11;
 * @return {!Array<string>}
 */
proto.packs.PackStatus.prototype.getUnlistedVersionsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 11));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.packs.PackStatus} returns this
 */
proto.packs.PackStatus.prototype.setUnlistedVersionsList = function(value) {
  return jspb.Message.setField(this, 11, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.packs.PackStatus} returns this
 */
proto.packs.PackStatus.prototype.addUnlistedVersions = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 11, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.PackStatus} returns this
 */
proto.packs.PackStatus.prototype.clearUnlistedVersionsList = function() {
  return this.setUnlistedVersionsList([]);
};


/**
 * optional bool unlisted_pack_family = 12;
 * @return {boolean}
 */
proto.packs.PackStatus.prototype.getUnlistedPackFamily = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 12, false));
};


/**
 * @param {boolean} value
 * @return {!proto.packs.PackStatus} returns this
 */
proto.packs.PackStatus.prototype.setUnlistedPackFamily = function(value) {
  return jspb.Message.setProto3BooleanField(this, 12, value);
};


/**
 * optional bool deprecated_pack_family = 13;
 * @return {boolean}
 */
proto.packs.PackStatus.prototype.getDeprecatedPackFamily = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 13, false));
};


/**
 * @param {boolean} value
 * @return {!proto.packs.PackStatus} returns this
 */
proto.packs.PackStatus.prototype.setDeprecatedPackFamily = function(value) {
  return jspb.Message.setProto3BooleanField(this, 13, value);
};


/**
 * optional bool incomplete_version_information = 14;
 * @return {boolean}
 */
proto.packs.PackStatus.prototype.getIncompleteVersionInformation = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 14, false));
};


/**
 * @param {boolean} value
 * @return {!proto.packs.PackStatus} returns this
 */
proto.packs.PackStatus.prototype.setIncompleteVersionInformation = function(value) {
  return jspb.Message.setProto3BooleanField(this, 14, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.PackLoadStatus.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.PackLoadStatus.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.PackLoadStatus} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.PackLoadStatus.toObject = function(includeInstance, msg) {
  var f, obj = {
    packsLoaded: jspb.Message.getFieldWithDefault(msg, 1, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.PackLoadStatus}
 */
proto.packs.PackLoadStatus.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.PackLoadStatus;
  return proto.packs.PackLoadStatus.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.PackLoadStatus} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.PackLoadStatus}
 */
proto.packs.PackLoadStatus.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readUint64());
      msg.setPacksLoaded(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.PackLoadStatus.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.PackLoadStatus.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.PackLoadStatus} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.PackLoadStatus.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPacksLoaded();
  if (f !== 0) {
    writer.writeUint64(
      1,
      f
    );
  }
};


/**
 * optional uint64 packs_loaded = 1;
 * @return {number}
 */
proto.packs.PackLoadStatus.prototype.getPacksLoaded = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {number} value
 * @return {!proto.packs.PackLoadStatus} returns this
 */
proto.packs.PackLoadStatus.prototype.setPacksLoaded = function(value) {
  return jspb.Message.setProto3IntField(this, 1, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.BoardId.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.BoardId.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.BoardId} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.BoardId.toObject = function(includeInstance, msg) {
  var f, obj = {
    name: jspb.Message.getFieldWithDefault(msg, 1, ""),
    vendor: jspb.Message.getFieldWithDefault(msg, 2, ""),
    revision: jspb.Message.getFieldWithDefault(msg, 3, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.BoardId}
 */
proto.packs.BoardId.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.BoardId;
  return proto.packs.BoardId.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.BoardId} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.BoardId}
 */
proto.packs.BoardId.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setName(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setVendor(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setRevision(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.BoardId.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.BoardId.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.BoardId} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.BoardId.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getName();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getVendor();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getRevision();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
};


/**
 * optional string name = 1;
 * @return {string}
 */
proto.packs.BoardId.prototype.getName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.BoardId} returns this
 */
proto.packs.BoardId.prototype.setName = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string vendor = 2;
 * @return {string}
 */
proto.packs.BoardId.prototype.getVendor = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.BoardId} returns this
 */
proto.packs.BoardId.prototype.setVendor = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string revision = 3;
 * @return {string}
 */
proto.packs.BoardId.prototype.getRevision = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.BoardId} returns this
 */
proto.packs.BoardId.prototype.setRevision = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.BoardFilter.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.BoardFilter.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.BoardFilter} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.BoardFilter.toObject = function(includeInstance, msg) {
  var f, obj = {
    name: jspb.Message.getFieldWithDefault(msg, 1, ""),
    vendor: jspb.Message.getFieldWithDefault(msg, 2, ""),
    revision: jspb.Message.getFieldWithDefault(msg, 3, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.BoardFilter}
 */
proto.packs.BoardFilter.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.BoardFilter;
  return proto.packs.BoardFilter.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.BoardFilter} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.BoardFilter}
 */
proto.packs.BoardFilter.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setName(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setVendor(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setRevision(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.BoardFilter.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.BoardFilter.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.BoardFilter} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.BoardFilter.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = /** @type {string} */ (jspb.Message.getField(message, 1));
  if (f != null) {
    writer.writeString(
      1,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 2));
  if (f != null) {
    writer.writeString(
      2,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 3));
  if (f != null) {
    writer.writeString(
      3,
      f
    );
  }
};


/**
 * optional string name = 1;
 * @return {string}
 */
proto.packs.BoardFilter.prototype.getName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.BoardFilter} returns this
 */
proto.packs.BoardFilter.prototype.setName = function(value) {
  return jspb.Message.setField(this, 1, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.packs.BoardFilter} returns this
 */
proto.packs.BoardFilter.prototype.clearName = function() {
  return jspb.Message.setField(this, 1, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.BoardFilter.prototype.hasName = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional string vendor = 2;
 * @return {string}
 */
proto.packs.BoardFilter.prototype.getVendor = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.BoardFilter} returns this
 */
proto.packs.BoardFilter.prototype.setVendor = function(value) {
  return jspb.Message.setField(this, 2, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.packs.BoardFilter} returns this
 */
proto.packs.BoardFilter.prototype.clearVendor = function() {
  return jspb.Message.setField(this, 2, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.BoardFilter.prototype.hasVendor = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional string revision = 3;
 * @return {string}
 */
proto.packs.BoardFilter.prototype.getRevision = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.BoardFilter} returns this
 */
proto.packs.BoardFilter.prototype.setRevision = function(value) {
  return jspb.Message.setField(this, 3, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.packs.BoardFilter} returns this
 */
proto.packs.BoardFilter.prototype.clearRevision = function() {
  return jspb.Message.setField(this, 3, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.BoardFilter.prototype.hasRevision = function() {
  return jspb.Message.getField(this, 3) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.PackFamilyId.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.PackFamilyId.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.PackFamilyId} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.PackFamilyId.toObject = function(includeInstance, msg) {
  var f, obj = {
    name: jspb.Message.getFieldWithDefault(msg, 1, ""),
    vendor: jspb.Message.getFieldWithDefault(msg, 2, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.PackFamilyId}
 */
proto.packs.PackFamilyId.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.PackFamilyId;
  return proto.packs.PackFamilyId.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.PackFamilyId} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.PackFamilyId}
 */
proto.packs.PackFamilyId.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setName(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setVendor(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.PackFamilyId.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.PackFamilyId.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.PackFamilyId} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.PackFamilyId.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getName();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getVendor();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
};


/**
 * optional string name = 1;
 * @return {string}
 */
proto.packs.PackFamilyId.prototype.getName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.PackFamilyId} returns this
 */
proto.packs.PackFamilyId.prototype.setName = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string vendor = 2;
 * @return {string}
 */
proto.packs.PackFamilyId.prototype.getVendor = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.PackFamilyId} returns this
 */
proto.packs.PackFamilyId.prototype.setVendor = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.PackId.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.PackId.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.PackId} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.PackId.toObject = function(includeInstance, msg) {
  var f, obj = {
    name: jspb.Message.getFieldWithDefault(msg, 1, ""),
    vendor: jspb.Message.getFieldWithDefault(msg, 2, ""),
    version: jspb.Message.getFieldWithDefault(msg, 3, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.PackId}
 */
proto.packs.PackId.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.PackId;
  return proto.packs.PackId.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.PackId} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.PackId}
 */
proto.packs.PackId.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setName(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setVendor(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setVersion(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.PackId.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.PackId.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.PackId} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.PackId.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getName();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getVendor();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getVersion();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
};


/**
 * optional string name = 1;
 * @return {string}
 */
proto.packs.PackId.prototype.getName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.PackId} returns this
 */
proto.packs.PackId.prototype.setName = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string vendor = 2;
 * @return {string}
 */
proto.packs.PackId.prototype.getVendor = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.PackId} returns this
 */
proto.packs.PackId.prototype.setVendor = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string version = 3;
 * @return {string}
 */
proto.packs.PackId.prototype.getVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.PackId} returns this
 */
proto.packs.PackId.prototype.setVersion = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.PackDeprecation.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.PackDeprecation.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.PackDeprecation} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.PackDeprecation.toObject = function(includeInstance, msg) {
  var f, obj = {
    deprecated: jspb.Message.getBooleanFieldWithDefault(msg, 1, false),
    deprecationDate: (f = msg.getDeprecationDate()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    replacement: (f = msg.getReplacement()) && proto.packs.PackFamilyId.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.PackDeprecation}
 */
proto.packs.PackDeprecation.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.PackDeprecation;
  return proto.packs.PackDeprecation.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.PackDeprecation} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.PackDeprecation}
 */
proto.packs.PackDeprecation.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setDeprecated(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setDeprecationDate(value);
      break;
    case 3:
      var value = new proto.packs.PackFamilyId;
      reader.readMessage(value,proto.packs.PackFamilyId.deserializeBinaryFromReader);
      msg.setReplacement(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.PackDeprecation.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.PackDeprecation.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.PackDeprecation} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.PackDeprecation.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getDeprecated();
  if (f) {
    writer.writeBool(
      1,
      f
    );
  }
  f = message.getDeprecationDate();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getReplacement();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.packs.PackFamilyId.serializeBinaryToWriter
    );
  }
};


/**
 * optional bool deprecated = 1;
 * @return {boolean}
 */
proto.packs.PackDeprecation.prototype.getDeprecated = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 1, false));
};


/**
 * @param {boolean} value
 * @return {!proto.packs.PackDeprecation} returns this
 */
proto.packs.PackDeprecation.prototype.setDeprecated = function(value) {
  return jspb.Message.setProto3BooleanField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp deprecation_date = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.packs.PackDeprecation.prototype.getDeprecationDate = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.packs.PackDeprecation} returns this
*/
proto.packs.PackDeprecation.prototype.setDeprecationDate = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.PackDeprecation} returns this
 */
proto.packs.PackDeprecation.prototype.clearDeprecationDate = function() {
  return this.setDeprecationDate(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.PackDeprecation.prototype.hasDeprecationDate = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional PackFamilyId replacement = 3;
 * @return {?proto.packs.PackFamilyId}
 */
proto.packs.PackDeprecation.prototype.getReplacement = function() {
  return /** @type{?proto.packs.PackFamilyId} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackFamilyId, 3));
};


/**
 * @param {?proto.packs.PackFamilyId|undefined} value
 * @return {!proto.packs.PackDeprecation} returns this
*/
proto.packs.PackDeprecation.prototype.setReplacement = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.PackDeprecation} returns this
 */
proto.packs.PackDeprecation.prototype.clearReplacement = function() {
  return this.setReplacement(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.PackDeprecation.prototype.hasReplacement = function() {
  return jspb.Message.getField(this, 3) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.PackContents.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.PackContents.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.PackContents} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.PackContents.toObject = function(includeInstance, msg) {
  var f, obj = {
    definesdevices: jspb.Message.getBooleanFieldWithDefault(msg, 1, false),
    definesboards: jspb.Message.getBooleanFieldWithDefault(msg, 2, false)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.PackContents}
 */
proto.packs.PackContents.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.PackContents;
  return proto.packs.PackContents.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.PackContents} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.PackContents}
 */
proto.packs.PackContents.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setDefinesdevices(value);
      break;
    case 2:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setDefinesboards(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.PackContents.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.PackContents.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.PackContents} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.PackContents.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getDefinesdevices();
  if (f) {
    writer.writeBool(
      1,
      f
    );
  }
  f = message.getDefinesboards();
  if (f) {
    writer.writeBool(
      2,
      f
    );
  }
};


/**
 * optional bool definesDevices = 1;
 * @return {boolean}
 */
proto.packs.PackContents.prototype.getDefinesdevices = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 1, false));
};


/**
 * @param {boolean} value
 * @return {!proto.packs.PackContents} returns this
 */
proto.packs.PackContents.prototype.setDefinesdevices = function(value) {
  return jspb.Message.setProto3BooleanField(this, 1, value);
};


/**
 * optional bool definesBoards = 2;
 * @return {boolean}
 */
proto.packs.PackContents.prototype.getDefinesboards = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 2, false));
};


/**
 * @param {boolean} value
 * @return {!proto.packs.PackContents} returns this
 */
proto.packs.PackContents.prototype.setDefinesboards = function(value) {
  return jspb.Message.setProto3BooleanField(this, 2, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.packs.PackFamilyInfo.repeatedFields_ = [5,7];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.PackFamilyInfo.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.PackFamilyInfo.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.PackFamilyInfo} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.PackFamilyInfo.toObject = function(includeInstance, msg) {
  var f, obj = {
    packFamilyId: (f = msg.getPackFamilyId()) && proto.packs.PackFamilyId.toObject(includeInstance, f),
    currentRelease: (f = msg.getCurrentRelease()) && proto.packs.PackReleaseInfo.toObject(includeInstance, f),
    latestRelease: (f = msg.getLatestRelease()) && proto.packs.PackReleaseInfo.toObject(includeInstance, f),
    description: jspb.Message.getFieldWithDefault(msg, 4, ""),
    keywordsList: (f = jspb.Message.getRepeatedField(msg, 5)) == null ? undefined : f,
    releasesList: jspb.Message.toObjectList(msg.getReleasesList(),
    proto.packs.PackReleaseInfo.toObject, includeInstance),
    deprecation: (f = msg.getDeprecation()) && proto.packs.PackDeprecation.toObject(includeInstance, f),
    contents: (f = msg.getContents()) && proto.packs.PackContents.toObject(includeInstance, f),
    overview: (f = msg.getOverview()) && proto.packs.PackFileReference.toObject(includeInstance, f),
    repository: (f = msg.getRepository()) && proto.packs.PackRepository.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.PackFamilyInfo}
 */
proto.packs.PackFamilyInfo.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.PackFamilyInfo;
  return proto.packs.PackFamilyInfo.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.PackFamilyInfo} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.PackFamilyInfo}
 */
proto.packs.PackFamilyInfo.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.PackFamilyId;
      reader.readMessage(value,proto.packs.PackFamilyId.deserializeBinaryFromReader);
      msg.setPackFamilyId(value);
      break;
    case 2:
      var value = new proto.packs.PackReleaseInfo;
      reader.readMessage(value,proto.packs.PackReleaseInfo.deserializeBinaryFromReader);
      msg.setCurrentRelease(value);
      break;
    case 3:
      var value = new proto.packs.PackReleaseInfo;
      reader.readMessage(value,proto.packs.PackReleaseInfo.deserializeBinaryFromReader);
      msg.setLatestRelease(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setDescription(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.addKeywords(value);
      break;
    case 7:
      var value = new proto.packs.PackReleaseInfo;
      reader.readMessage(value,proto.packs.PackReleaseInfo.deserializeBinaryFromReader);
      msg.addReleases(value);
      break;
    case 8:
      var value = new proto.packs.PackDeprecation;
      reader.readMessage(value,proto.packs.PackDeprecation.deserializeBinaryFromReader);
      msg.setDeprecation(value);
      break;
    case 9:
      var value = new proto.packs.PackContents;
      reader.readMessage(value,proto.packs.PackContents.deserializeBinaryFromReader);
      msg.setContents(value);
      break;
    case 10:
      var value = new proto.packs.PackFileReference;
      reader.readMessage(value,proto.packs.PackFileReference.deserializeBinaryFromReader);
      msg.setOverview(value);
      break;
    case 11:
      var value = new proto.packs.PackRepository;
      reader.readMessage(value,proto.packs.PackRepository.deserializeBinaryFromReader);
      msg.setRepository(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.PackFamilyInfo.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.PackFamilyInfo.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.PackFamilyInfo} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.PackFamilyInfo.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPackFamilyId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.packs.PackFamilyId.serializeBinaryToWriter
    );
  }
  f = message.getCurrentRelease();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.packs.PackReleaseInfo.serializeBinaryToWriter
    );
  }
  f = message.getLatestRelease();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.packs.PackReleaseInfo.serializeBinaryToWriter
    );
  }
  f = message.getDescription();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getKeywordsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      5,
      f
    );
  }
  f = message.getReleasesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      7,
      f,
      proto.packs.PackReleaseInfo.serializeBinaryToWriter
    );
  }
  f = message.getDeprecation();
  if (f != null) {
    writer.writeMessage(
      8,
      f,
      proto.packs.PackDeprecation.serializeBinaryToWriter
    );
  }
  f = message.getContents();
  if (f != null) {
    writer.writeMessage(
      9,
      f,
      proto.packs.PackContents.serializeBinaryToWriter
    );
  }
  f = message.getOverview();
  if (f != null) {
    writer.writeMessage(
      10,
      f,
      proto.packs.PackFileReference.serializeBinaryToWriter
    );
  }
  f = message.getRepository();
  if (f != null) {
    writer.writeMessage(
      11,
      f,
      proto.packs.PackRepository.serializeBinaryToWriter
    );
  }
};


/**
 * optional PackFamilyId pack_family_id = 1;
 * @return {?proto.packs.PackFamilyId}
 */
proto.packs.PackFamilyInfo.prototype.getPackFamilyId = function() {
  return /** @type{?proto.packs.PackFamilyId} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackFamilyId, 1));
};


/**
 * @param {?proto.packs.PackFamilyId|undefined} value
 * @return {!proto.packs.PackFamilyInfo} returns this
*/
proto.packs.PackFamilyInfo.prototype.setPackFamilyId = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.PackFamilyInfo} returns this
 */
proto.packs.PackFamilyInfo.prototype.clearPackFamilyId = function() {
  return this.setPackFamilyId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.PackFamilyInfo.prototype.hasPackFamilyId = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional PackReleaseInfo current_release = 2;
 * @return {?proto.packs.PackReleaseInfo}
 */
proto.packs.PackFamilyInfo.prototype.getCurrentRelease = function() {
  return /** @type{?proto.packs.PackReleaseInfo} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackReleaseInfo, 2));
};


/**
 * @param {?proto.packs.PackReleaseInfo|undefined} value
 * @return {!proto.packs.PackFamilyInfo} returns this
*/
proto.packs.PackFamilyInfo.prototype.setCurrentRelease = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.PackFamilyInfo} returns this
 */
proto.packs.PackFamilyInfo.prototype.clearCurrentRelease = function() {
  return this.setCurrentRelease(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.PackFamilyInfo.prototype.hasCurrentRelease = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional PackReleaseInfo latest_release = 3;
 * @return {?proto.packs.PackReleaseInfo}
 */
proto.packs.PackFamilyInfo.prototype.getLatestRelease = function() {
  return /** @type{?proto.packs.PackReleaseInfo} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackReleaseInfo, 3));
};


/**
 * @param {?proto.packs.PackReleaseInfo|undefined} value
 * @return {!proto.packs.PackFamilyInfo} returns this
*/
proto.packs.PackFamilyInfo.prototype.setLatestRelease = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.PackFamilyInfo} returns this
 */
proto.packs.PackFamilyInfo.prototype.clearLatestRelease = function() {
  return this.setLatestRelease(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.PackFamilyInfo.prototype.hasLatestRelease = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional string description = 4;
 * @return {string}
 */
proto.packs.PackFamilyInfo.prototype.getDescription = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.PackFamilyInfo} returns this
 */
proto.packs.PackFamilyInfo.prototype.setDescription = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * repeated string keywords = 5;
 * @return {!Array<string>}
 */
proto.packs.PackFamilyInfo.prototype.getKeywordsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 5));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.packs.PackFamilyInfo} returns this
 */
proto.packs.PackFamilyInfo.prototype.setKeywordsList = function(value) {
  return jspb.Message.setField(this, 5, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.packs.PackFamilyInfo} returns this
 */
proto.packs.PackFamilyInfo.prototype.addKeywords = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 5, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.PackFamilyInfo} returns this
 */
proto.packs.PackFamilyInfo.prototype.clearKeywordsList = function() {
  return this.setKeywordsList([]);
};


/**
 * repeated PackReleaseInfo releases = 7;
 * @return {!Array<!proto.packs.PackReleaseInfo>}
 */
proto.packs.PackFamilyInfo.prototype.getReleasesList = function() {
  return /** @type{!Array<!proto.packs.PackReleaseInfo>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.packs.PackReleaseInfo, 7));
};


/**
 * @param {!Array<!proto.packs.PackReleaseInfo>} value
 * @return {!proto.packs.PackFamilyInfo} returns this
*/
proto.packs.PackFamilyInfo.prototype.setReleasesList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 7, value);
};


/**
 * @param {!proto.packs.PackReleaseInfo=} opt_value
 * @param {number=} opt_index
 * @return {!proto.packs.PackReleaseInfo}
 */
proto.packs.PackFamilyInfo.prototype.addReleases = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 7, opt_value, proto.packs.PackReleaseInfo, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.PackFamilyInfo} returns this
 */
proto.packs.PackFamilyInfo.prototype.clearReleasesList = function() {
  return this.setReleasesList([]);
};


/**
 * optional PackDeprecation deprecation = 8;
 * @return {?proto.packs.PackDeprecation}
 */
proto.packs.PackFamilyInfo.prototype.getDeprecation = function() {
  return /** @type{?proto.packs.PackDeprecation} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackDeprecation, 8));
};


/**
 * @param {?proto.packs.PackDeprecation|undefined} value
 * @return {!proto.packs.PackFamilyInfo} returns this
*/
proto.packs.PackFamilyInfo.prototype.setDeprecation = function(value) {
  return jspb.Message.setWrapperField(this, 8, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.PackFamilyInfo} returns this
 */
proto.packs.PackFamilyInfo.prototype.clearDeprecation = function() {
  return this.setDeprecation(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.PackFamilyInfo.prototype.hasDeprecation = function() {
  return jspb.Message.getField(this, 8) != null;
};


/**
 * optional PackContents contents = 9;
 * @return {?proto.packs.PackContents}
 */
proto.packs.PackFamilyInfo.prototype.getContents = function() {
  return /** @type{?proto.packs.PackContents} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackContents, 9));
};


/**
 * @param {?proto.packs.PackContents|undefined} value
 * @return {!proto.packs.PackFamilyInfo} returns this
*/
proto.packs.PackFamilyInfo.prototype.setContents = function(value) {
  return jspb.Message.setWrapperField(this, 9, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.PackFamilyInfo} returns this
 */
proto.packs.PackFamilyInfo.prototype.clearContents = function() {
  return this.setContents(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.PackFamilyInfo.prototype.hasContents = function() {
  return jspb.Message.getField(this, 9) != null;
};


/**
 * optional PackFileReference overview = 10;
 * @return {?proto.packs.PackFileReference}
 */
proto.packs.PackFamilyInfo.prototype.getOverview = function() {
  return /** @type{?proto.packs.PackFileReference} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackFileReference, 10));
};


/**
 * @param {?proto.packs.PackFileReference|undefined} value
 * @return {!proto.packs.PackFamilyInfo} returns this
*/
proto.packs.PackFamilyInfo.prototype.setOverview = function(value) {
  return jspb.Message.setWrapperField(this, 10, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.PackFamilyInfo} returns this
 */
proto.packs.PackFamilyInfo.prototype.clearOverview = function() {
  return this.setOverview(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.PackFamilyInfo.prototype.hasOverview = function() {
  return jspb.Message.getField(this, 10) != null;
};


/**
 * optional PackRepository repository = 11;
 * @return {?proto.packs.PackRepository}
 */
proto.packs.PackFamilyInfo.prototype.getRepository = function() {
  return /** @type{?proto.packs.PackRepository} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackRepository, 11));
};


/**
 * @param {?proto.packs.PackRepository|undefined} value
 * @return {!proto.packs.PackFamilyInfo} returns this
*/
proto.packs.PackFamilyInfo.prototype.setRepository = function(value) {
  return jspb.Message.setWrapperField(this, 11, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.PackFamilyInfo} returns this
 */
proto.packs.PackFamilyInfo.prototype.clearRepository = function() {
  return this.setRepository(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.PackFamilyInfo.prototype.hasRepository = function() {
  return jspb.Message.getField(this, 11) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.PackRepository.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.PackRepository.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.PackRepository} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.PackRepository.toObject = function(includeInstance, msg) {
  var f, obj = {
    type: jspb.Message.getFieldWithDefault(msg, 1, ""),
    url: jspb.Message.getFieldWithDefault(msg, 2, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.PackRepository}
 */
proto.packs.PackRepository.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.PackRepository;
  return proto.packs.PackRepository.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.PackRepository} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.PackRepository}
 */
proto.packs.PackRepository.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setType(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setUrl(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.PackRepository.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.PackRepository.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.PackRepository} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.PackRepository.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getType();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getUrl();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
};


/**
 * optional string type = 1;
 * @return {string}
 */
proto.packs.PackRepository.prototype.getType = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.PackRepository} returns this
 */
proto.packs.PackRepository.prototype.setType = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string url = 2;
 * @return {string}
 */
proto.packs.PackRepository.prototype.getUrl = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.PackRepository} returns this
 */
proto.packs.PackRepository.prototype.setUrl = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.PackReleaseInfo.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.PackReleaseInfo.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.PackReleaseInfo} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.PackReleaseInfo.toObject = function(includeInstance, msg) {
  var f, obj = {
    packId: (f = msg.getPackId()) && proto.packs.PackId.toObject(includeInstance, f),
    releaseDate: (f = msg.getReleaseDate()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    downloadUrl: jspb.Message.getFieldWithDefault(msg, 3, ""),
    releaseNote: jspb.Message.getFieldWithDefault(msg, 4, ""),
    isPrerelease: jspb.Message.getBooleanFieldWithDefault(msg, 5, false),
    installSpecification: jspb.Message.getFieldWithDefault(msg, 6, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.PackReleaseInfo}
 */
proto.packs.PackReleaseInfo.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.PackReleaseInfo;
  return proto.packs.PackReleaseInfo.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.PackReleaseInfo} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.PackReleaseInfo}
 */
proto.packs.PackReleaseInfo.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.PackId;
      reader.readMessage(value,proto.packs.PackId.deserializeBinaryFromReader);
      msg.setPackId(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setReleaseDate(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setDownloadUrl(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setReleaseNote(value);
      break;
    case 5:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setIsPrerelease(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readString());
      msg.setInstallSpecification(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.PackReleaseInfo.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.PackReleaseInfo.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.PackReleaseInfo} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.PackReleaseInfo.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPackId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.packs.PackId.serializeBinaryToWriter
    );
  }
  f = message.getReleaseDate();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getDownloadUrl();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getReleaseNote();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getIsPrerelease();
  if (f) {
    writer.writeBool(
      5,
      f
    );
  }
  f = message.getInstallSpecification();
  if (f.length > 0) {
    writer.writeString(
      6,
      f
    );
  }
};


/**
 * optional PackId pack_id = 1;
 * @return {?proto.packs.PackId}
 */
proto.packs.PackReleaseInfo.prototype.getPackId = function() {
  return /** @type{?proto.packs.PackId} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackId, 1));
};


/**
 * @param {?proto.packs.PackId|undefined} value
 * @return {!proto.packs.PackReleaseInfo} returns this
*/
proto.packs.PackReleaseInfo.prototype.setPackId = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.PackReleaseInfo} returns this
 */
proto.packs.PackReleaseInfo.prototype.clearPackId = function() {
  return this.setPackId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.PackReleaseInfo.prototype.hasPackId = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional google.protobuf.Timestamp release_date = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.packs.PackReleaseInfo.prototype.getReleaseDate = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/**
 * @param {?proto.google.protobuf.Timestamp|undefined} value
 * @return {!proto.packs.PackReleaseInfo} returns this
*/
proto.packs.PackReleaseInfo.prototype.setReleaseDate = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.PackReleaseInfo} returns this
 */
proto.packs.PackReleaseInfo.prototype.clearReleaseDate = function() {
  return this.setReleaseDate(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.PackReleaseInfo.prototype.hasReleaseDate = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional string download_url = 3;
 * @return {string}
 */
proto.packs.PackReleaseInfo.prototype.getDownloadUrl = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.PackReleaseInfo} returns this
 */
proto.packs.PackReleaseInfo.prototype.setDownloadUrl = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string release_note = 4;
 * @return {string}
 */
proto.packs.PackReleaseInfo.prototype.getReleaseNote = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.PackReleaseInfo} returns this
 */
proto.packs.PackReleaseInfo.prototype.setReleaseNote = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional bool is_prerelease = 5;
 * @return {boolean}
 */
proto.packs.PackReleaseInfo.prototype.getIsPrerelease = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 5, false));
};


/**
 * @param {boolean} value
 * @return {!proto.packs.PackReleaseInfo} returns this
 */
proto.packs.PackReleaseInfo.prototype.setIsPrerelease = function(value) {
  return jspb.Message.setProto3BooleanField(this, 5, value);
};


/**
 * optional string install_specification = 6;
 * @return {string}
 */
proto.packs.PackReleaseInfo.prototype.getInstallSpecification = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.PackReleaseInfo} returns this
 */
proto.packs.PackReleaseInfo.prototype.setInstallSpecification = function(value) {
  return jspb.Message.setProto3StringField(this, 6, value);
};



/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.packs.AssetReference.oneofGroups_ = [[1,2]];

/**
 * @enum {number}
 */
proto.packs.AssetReference.AssetReferenceCase = {
  ASSET_REFERENCE_NOT_SET: 0,
  PACK_FILE_REFERENCE: 1,
  URL: 2
};

/**
 * @return {proto.packs.AssetReference.AssetReferenceCase}
 */
proto.packs.AssetReference.prototype.getAssetReferenceCase = function() {
  return /** @type {proto.packs.AssetReference.AssetReferenceCase} */(jspb.Message.computeOneofCase(this, proto.packs.AssetReference.oneofGroups_[0]));
};



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.AssetReference.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.AssetReference.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.AssetReference} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.AssetReference.toObject = function(includeInstance, msg) {
  var f, obj = {
    packFileReference: (f = msg.getPackFileReference()) && proto.packs.PackFileReference.toObject(includeInstance, f),
    url: jspb.Message.getFieldWithDefault(msg, 2, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.AssetReference}
 */
proto.packs.AssetReference.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.AssetReference;
  return proto.packs.AssetReference.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.AssetReference} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.AssetReference}
 */
proto.packs.AssetReference.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.PackFileReference;
      reader.readMessage(value,proto.packs.PackFileReference.deserializeBinaryFromReader);
      msg.setPackFileReference(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setUrl(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.AssetReference.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.AssetReference.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.AssetReference} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.AssetReference.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPackFileReference();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.packs.PackFileReference.serializeBinaryToWriter
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 2));
  if (f != null) {
    writer.writeString(
      2,
      f
    );
  }
};


/**
 * optional PackFileReference pack_file_reference = 1;
 * @return {?proto.packs.PackFileReference}
 */
proto.packs.AssetReference.prototype.getPackFileReference = function() {
  return /** @type{?proto.packs.PackFileReference} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackFileReference, 1));
};


/**
 * @param {?proto.packs.PackFileReference|undefined} value
 * @return {!proto.packs.AssetReference} returns this
*/
proto.packs.AssetReference.prototype.setPackFileReference = function(value) {
  return jspb.Message.setOneofWrapperField(this, 1, proto.packs.AssetReference.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.AssetReference} returns this
 */
proto.packs.AssetReference.prototype.clearPackFileReference = function() {
  return this.setPackFileReference(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.AssetReference.prototype.hasPackFileReference = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional string url = 2;
 * @return {string}
 */
proto.packs.AssetReference.prototype.getUrl = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.AssetReference} returns this
 */
proto.packs.AssetReference.prototype.setUrl = function(value) {
  return jspb.Message.setOneofField(this, 2, proto.packs.AssetReference.oneofGroups_[0], value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.packs.AssetReference} returns this
 */
proto.packs.AssetReference.prototype.clearUrl = function() {
  return jspb.Message.setOneofField(this, 2, proto.packs.AssetReference.oneofGroups_[0], undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.AssetReference.prototype.hasUrl = function() {
  return jspb.Message.getField(this, 2) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.PackFileReference.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.PackFileReference.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.PackFileReference} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.PackFileReference.toObject = function(includeInstance, msg) {
  var f, obj = {
    packId: (f = msg.getPackId()) && proto.packs.PackId.toObject(includeInstance, f),
    path: jspb.Message.getFieldWithDefault(msg, 2, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.PackFileReference}
 */
proto.packs.PackFileReference.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.PackFileReference;
  return proto.packs.PackFileReference.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.PackFileReference} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.PackFileReference}
 */
proto.packs.PackFileReference.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.PackId;
      reader.readMessage(value,proto.packs.PackId.deserializeBinaryFromReader);
      msg.setPackId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setPath(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.PackFileReference.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.PackFileReference.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.PackFileReference} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.PackFileReference.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPackId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.packs.PackId.serializeBinaryToWriter
    );
  }
  f = message.getPath();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
};


/**
 * optional PackId pack_id = 1;
 * @return {?proto.packs.PackId}
 */
proto.packs.PackFileReference.prototype.getPackId = function() {
  return /** @type{?proto.packs.PackId} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackId, 1));
};


/**
 * @param {?proto.packs.PackId|undefined} value
 * @return {!proto.packs.PackFileReference} returns this
*/
proto.packs.PackFileReference.prototype.setPackId = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.PackFileReference} returns this
 */
proto.packs.PackFileReference.prototype.clearPackId = function() {
  return this.setPackId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.PackFileReference.prototype.hasPackId = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional string path = 2;
 * @return {string}
 */
proto.packs.PackFileReference.prototype.getPath = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.PackFileReference} returns this
 */
proto.packs.PackFileReference.prototype.setPath = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.AbsolutePackFilePath.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.AbsolutePackFilePath.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.AbsolutePackFilePath} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.AbsolutePackFilePath.toObject = function(includeInstance, msg) {
  var f, obj = {
    path: jspb.Message.getFieldWithDefault(msg, 1, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.AbsolutePackFilePath}
 */
proto.packs.AbsolutePackFilePath.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.AbsolutePackFilePath;
  return proto.packs.AbsolutePackFilePath.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.AbsolutePackFilePath} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.AbsolutePackFilePath}
 */
proto.packs.AbsolutePackFilePath.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setPath(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.AbsolutePackFilePath.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.AbsolutePackFilePath.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.AbsolutePackFilePath} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.AbsolutePackFilePath.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPath();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
};


/**
 * optional string path = 1;
 * @return {string}
 */
proto.packs.AbsolutePackFilePath.prototype.getPath = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.AbsolutePackFilePath} returns this
 */
proto.packs.AbsolutePackFilePath.prototype.setPath = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.DebugInterface.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.DebugInterface.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.DebugInterface} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.DebugInterface.toObject = function(includeInstance, msg) {
  var f, obj = {
    adapter: jspb.Message.getFieldWithDefault(msg, 1, ""),
    connector: jspb.Message.getFieldWithDefault(msg, 2, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.DebugInterface}
 */
proto.packs.DebugInterface.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.DebugInterface;
  return proto.packs.DebugInterface.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.DebugInterface} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.DebugInterface}
 */
proto.packs.DebugInterface.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setAdapter(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setConnector(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.DebugInterface.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.DebugInterface.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.DebugInterface} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.DebugInterface.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAdapter();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getConnector();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
};


/**
 * optional string adapter = 1;
 * @return {string}
 */
proto.packs.DebugInterface.prototype.getAdapter = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.DebugInterface} returns this
 */
proto.packs.DebugInterface.prototype.setAdapter = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string connector = 2;
 * @return {string}
 */
proto.packs.DebugInterface.prototype.getConnector = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.DebugInterface} returns this
 */
proto.packs.DebugInterface.prototype.setConnector = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.BoardFeature.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.BoardFeature.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.BoardFeature} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.BoardFeature.toObject = function(includeInstance, msg) {
  var f, obj = {
    type: jspb.Message.getFieldWithDefault(msg, 1, ""),
    name: jspb.Message.getFieldWithDefault(msg, 2, ""),
    category: jspb.Message.getFieldWithDefault(msg, 3, ""),
    detail: jspb.Message.getFieldWithDefault(msg, 4, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.BoardFeature}
 */
proto.packs.BoardFeature.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.BoardFeature;
  return proto.packs.BoardFeature.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.BoardFeature} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.BoardFeature}
 */
proto.packs.BoardFeature.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setType(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setName(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setCategory(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setDetail(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.BoardFeature.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.BoardFeature.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.BoardFeature} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.BoardFeature.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getType();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getName();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getCategory();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getDetail();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
};


/**
 * optional string type = 1;
 * @return {string}
 */
proto.packs.BoardFeature.prototype.getType = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.BoardFeature} returns this
 */
proto.packs.BoardFeature.prototype.setType = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string name = 2;
 * @return {string}
 */
proto.packs.BoardFeature.prototype.getName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.BoardFeature} returns this
 */
proto.packs.BoardFeature.prototype.setName = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string category = 3;
 * @return {string}
 */
proto.packs.BoardFeature.prototype.getCategory = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.BoardFeature} returns this
 */
proto.packs.BoardFeature.prototype.setCategory = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string detail = 4;
 * @return {string}
 */
proto.packs.BoardFeature.prototype.getDetail = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.BoardFeature} returns this
 */
proto.packs.BoardFeature.prototype.setDetail = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.DeviceFeature.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.DeviceFeature.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.DeviceFeature} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.DeviceFeature.toObject = function(includeInstance, msg) {
  var f, obj = {
    type: jspb.Message.getFieldWithDefault(msg, 1, ""),
    name: jspb.Message.getFieldWithDefault(msg, 2, ""),
    category: jspb.Message.getFieldWithDefault(msg, 3, ""),
    detail: jspb.Message.getFieldWithDefault(msg, 4, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.DeviceFeature}
 */
proto.packs.DeviceFeature.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.DeviceFeature;
  return proto.packs.DeviceFeature.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.DeviceFeature} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.DeviceFeature}
 */
proto.packs.DeviceFeature.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setType(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setName(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setCategory(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setDetail(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.DeviceFeature.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.DeviceFeature.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.DeviceFeature} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.DeviceFeature.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getType();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getName();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getCategory();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getDetail();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
};


/**
 * optional string type = 1;
 * @return {string}
 */
proto.packs.DeviceFeature.prototype.getType = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.DeviceFeature} returns this
 */
proto.packs.DeviceFeature.prototype.setType = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string name = 2;
 * @return {string}
 */
proto.packs.DeviceFeature.prototype.getName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.DeviceFeature} returns this
 */
proto.packs.DeviceFeature.prototype.setName = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string category = 3;
 * @return {string}
 */
proto.packs.DeviceFeature.prototype.getCategory = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.DeviceFeature} returns this
 */
proto.packs.DeviceFeature.prototype.setCategory = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string detail = 4;
 * @return {string}
 */
proto.packs.DeviceFeature.prototype.getDetail = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.DeviceFeature} returns this
 */
proto.packs.DeviceFeature.prototype.setDetail = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.packs.Processor.repeatedFields_ = [12];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.Processor.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.Processor.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.Processor} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.Processor.toObject = function(includeInstance, msg) {
  var f, obj = {
    name: jspb.Message.getFieldWithDefault(msg, 1, ""),
    core: jspb.Message.getFieldWithDefault(msg, 2, ""),
    units: jspb.Message.getFieldWithDefault(msg, 3, 0),
    fpu: jspb.Message.getFieldWithDefault(msg, 4, 0),
    mpu: jspb.Message.getFieldWithDefault(msg, 5, 0),
    tz: jspb.Message.getFieldWithDefault(msg, 6, 0),
    dsp: jspb.Message.getFieldWithDefault(msg, 7, 0),
    mve: jspb.Message.getFieldWithDefault(msg, 8, 0),
    endian: jspb.Message.getFieldWithDefault(msg, 9, 0),
    clock: jspb.Message.getFieldWithDefault(msg, 10, 0),
    coreVersion: jspb.Message.getFieldWithDefault(msg, 11, ""),
    featuresList: jspb.Message.toObjectList(msg.getFeaturesList(),
    proto.packs.DeviceFeature.toObject, includeInstance)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.Processor}
 */
proto.packs.Processor.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.Processor;
  return proto.packs.Processor.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.Processor} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.Processor}
 */
proto.packs.Processor.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setName(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setCore(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readUint64());
      msg.setUnits(value);
      break;
    case 4:
      var value = /** @type {!proto.packs.Fpu} */ (reader.readEnum());
      msg.setFpu(value);
      break;
    case 5:
      var value = /** @type {!proto.packs.Mpu} */ (reader.readEnum());
      msg.setMpu(value);
      break;
    case 6:
      var value = /** @type {!proto.packs.Tz} */ (reader.readEnum());
      msg.setTz(value);
      break;
    case 7:
      var value = /** @type {!proto.packs.Dsp} */ (reader.readEnum());
      msg.setDsp(value);
      break;
    case 8:
      var value = /** @type {!proto.packs.Mve} */ (reader.readEnum());
      msg.setMve(value);
      break;
    case 9:
      var value = /** @type {!proto.packs.Endian} */ (reader.readEnum());
      msg.setEndian(value);
      break;
    case 10:
      var value = /** @type {number} */ (reader.readUint64());
      msg.setClock(value);
      break;
    case 11:
      var value = /** @type {string} */ (reader.readString());
      msg.setCoreVersion(value);
      break;
    case 12:
      var value = new proto.packs.DeviceFeature;
      reader.readMessage(value,proto.packs.DeviceFeature.deserializeBinaryFromReader);
      msg.addFeatures(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.Processor.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.Processor.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.Processor} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.Processor.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getName();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getCore();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getUnits();
  if (f !== 0) {
    writer.writeUint64(
      3,
      f
    );
  }
  f = message.getFpu();
  if (f !== 0.0) {
    writer.writeEnum(
      4,
      f
    );
  }
  f = message.getMpu();
  if (f !== 0.0) {
    writer.writeEnum(
      5,
      f
    );
  }
  f = message.getTz();
  if (f !== 0.0) {
    writer.writeEnum(
      6,
      f
    );
  }
  f = message.getDsp();
  if (f !== 0.0) {
    writer.writeEnum(
      7,
      f
    );
  }
  f = message.getMve();
  if (f !== 0.0) {
    writer.writeEnum(
      8,
      f
    );
  }
  f = message.getEndian();
  if (f !== 0.0) {
    writer.writeEnum(
      9,
      f
    );
  }
  f = message.getClock();
  if (f !== 0) {
    writer.writeUint64(
      10,
      f
    );
  }
  f = message.getCoreVersion();
  if (f.length > 0) {
    writer.writeString(
      11,
      f
    );
  }
  f = message.getFeaturesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      12,
      f,
      proto.packs.DeviceFeature.serializeBinaryToWriter
    );
  }
};


/**
 * optional string name = 1;
 * @return {string}
 */
proto.packs.Processor.prototype.getName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.Processor} returns this
 */
proto.packs.Processor.prototype.setName = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string core = 2;
 * @return {string}
 */
proto.packs.Processor.prototype.getCore = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.Processor} returns this
 */
proto.packs.Processor.prototype.setCore = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional uint64 units = 3;
 * @return {number}
 */
proto.packs.Processor.prototype.getUnits = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {number} value
 * @return {!proto.packs.Processor} returns this
 */
proto.packs.Processor.prototype.setUnits = function(value) {
  return jspb.Message.setProto3IntField(this, 3, value);
};


/**
 * optional Fpu fpu = 4;
 * @return {!proto.packs.Fpu}
 */
proto.packs.Processor.prototype.getFpu = function() {
  return /** @type {!proto.packs.Fpu} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {!proto.packs.Fpu} value
 * @return {!proto.packs.Processor} returns this
 */
proto.packs.Processor.prototype.setFpu = function(value) {
  return jspb.Message.setProto3EnumField(this, 4, value);
};


/**
 * optional Mpu mpu = 5;
 * @return {!proto.packs.Mpu}
 */
proto.packs.Processor.prototype.getMpu = function() {
  return /** @type {!proto.packs.Mpu} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {!proto.packs.Mpu} value
 * @return {!proto.packs.Processor} returns this
 */
proto.packs.Processor.prototype.setMpu = function(value) {
  return jspb.Message.setProto3EnumField(this, 5, value);
};


/**
 * optional Tz tz = 6;
 * @return {!proto.packs.Tz}
 */
proto.packs.Processor.prototype.getTz = function() {
  return /** @type {!proto.packs.Tz} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/**
 * @param {!proto.packs.Tz} value
 * @return {!proto.packs.Processor} returns this
 */
proto.packs.Processor.prototype.setTz = function(value) {
  return jspb.Message.setProto3EnumField(this, 6, value);
};


/**
 * optional Dsp dsp = 7;
 * @return {!proto.packs.Dsp}
 */
proto.packs.Processor.prototype.getDsp = function() {
  return /** @type {!proto.packs.Dsp} */ (jspb.Message.getFieldWithDefault(this, 7, 0));
};


/**
 * @param {!proto.packs.Dsp} value
 * @return {!proto.packs.Processor} returns this
 */
proto.packs.Processor.prototype.setDsp = function(value) {
  return jspb.Message.setProto3EnumField(this, 7, value);
};


/**
 * optional Mve mve = 8;
 * @return {!proto.packs.Mve}
 */
proto.packs.Processor.prototype.getMve = function() {
  return /** @type {!proto.packs.Mve} */ (jspb.Message.getFieldWithDefault(this, 8, 0));
};


/**
 * @param {!proto.packs.Mve} value
 * @return {!proto.packs.Processor} returns this
 */
proto.packs.Processor.prototype.setMve = function(value) {
  return jspb.Message.setProto3EnumField(this, 8, value);
};


/**
 * optional Endian endian = 9;
 * @return {!proto.packs.Endian}
 */
proto.packs.Processor.prototype.getEndian = function() {
  return /** @type {!proto.packs.Endian} */ (jspb.Message.getFieldWithDefault(this, 9, 0));
};


/**
 * @param {!proto.packs.Endian} value
 * @return {!proto.packs.Processor} returns this
 */
proto.packs.Processor.prototype.setEndian = function(value) {
  return jspb.Message.setProto3EnumField(this, 9, value);
};


/**
 * optional uint64 clock = 10;
 * @return {number}
 */
proto.packs.Processor.prototype.getClock = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 10, 0));
};


/**
 * @param {number} value
 * @return {!proto.packs.Processor} returns this
 */
proto.packs.Processor.prototype.setClock = function(value) {
  return jspb.Message.setProto3IntField(this, 10, value);
};


/**
 * optional string core_version = 11;
 * @return {string}
 */
proto.packs.Processor.prototype.getCoreVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 11, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.Processor} returns this
 */
proto.packs.Processor.prototype.setCoreVersion = function(value) {
  return jspb.Message.setProto3StringField(this, 11, value);
};


/**
 * repeated DeviceFeature features = 12;
 * @return {!Array<!proto.packs.DeviceFeature>}
 */
proto.packs.Processor.prototype.getFeaturesList = function() {
  return /** @type{!Array<!proto.packs.DeviceFeature>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.packs.DeviceFeature, 12));
};


/**
 * @param {!Array<!proto.packs.DeviceFeature>} value
 * @return {!proto.packs.Processor} returns this
*/
proto.packs.Processor.prototype.setFeaturesList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 12, value);
};


/**
 * @param {!proto.packs.DeviceFeature=} opt_value
 * @param {number=} opt_index
 * @return {!proto.packs.DeviceFeature}
 */
proto.packs.Processor.prototype.addFeatures = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 12, opt_value, proto.packs.DeviceFeature, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.Processor} returns this
 */
proto.packs.Processor.prototype.clearFeaturesList = function() {
  return this.setFeaturesList([]);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.BoardImage.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.BoardImage.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.BoardImage} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.BoardImage.toObject = function(includeInstance, msg) {
  var f, obj = {
    small: (f = msg.getSmall()) && proto.packs.AssetReference.toObject(includeInstance, f),
    large: (f = msg.getLarge()) && proto.packs.AssetReference.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.BoardImage}
 */
proto.packs.BoardImage.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.BoardImage;
  return proto.packs.BoardImage.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.BoardImage} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.BoardImage}
 */
proto.packs.BoardImage.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.AssetReference;
      reader.readMessage(value,proto.packs.AssetReference.deserializeBinaryFromReader);
      msg.setSmall(value);
      break;
    case 2:
      var value = new proto.packs.AssetReference;
      reader.readMessage(value,proto.packs.AssetReference.deserializeBinaryFromReader);
      msg.setLarge(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.BoardImage.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.BoardImage.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.BoardImage} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.BoardImage.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSmall();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.packs.AssetReference.serializeBinaryToWriter
    );
  }
  f = message.getLarge();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.packs.AssetReference.serializeBinaryToWriter
    );
  }
};


/**
 * optional AssetReference small = 1;
 * @return {?proto.packs.AssetReference}
 */
proto.packs.BoardImage.prototype.getSmall = function() {
  return /** @type{?proto.packs.AssetReference} */ (
    jspb.Message.getWrapperField(this, proto.packs.AssetReference, 1));
};


/**
 * @param {?proto.packs.AssetReference|undefined} value
 * @return {!proto.packs.BoardImage} returns this
*/
proto.packs.BoardImage.prototype.setSmall = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.BoardImage} returns this
 */
proto.packs.BoardImage.prototype.clearSmall = function() {
  return this.setSmall(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.BoardImage.prototype.hasSmall = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional AssetReference large = 2;
 * @return {?proto.packs.AssetReference}
 */
proto.packs.BoardImage.prototype.getLarge = function() {
  return /** @type{?proto.packs.AssetReference} */ (
    jspb.Message.getWrapperField(this, proto.packs.AssetReference, 2));
};


/**
 * @param {?proto.packs.AssetReference|undefined} value
 * @return {!proto.packs.BoardImage} returns this
*/
proto.packs.BoardImage.prototype.setLarge = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.BoardImage} returns this
 */
proto.packs.BoardImage.prototype.clearLarge = function() {
  return this.setLarge(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.BoardImage.prototype.hasLarge = function() {
  return jspb.Message.getField(this, 2) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.DeviceMemory.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.DeviceMemory.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.DeviceMemory} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.DeviceMemory.toObject = function(includeInstance, msg) {
  var f, obj = {
    name: jspb.Message.getFieldWithDefault(msg, 1, ""),
    size: jspb.Message.getFieldWithDefault(msg, 2, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.DeviceMemory}
 */
proto.packs.DeviceMemory.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.DeviceMemory;
  return proto.packs.DeviceMemory.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.DeviceMemory} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.DeviceMemory}
 */
proto.packs.DeviceMemory.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setName(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint64());
      msg.setSize(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.DeviceMemory.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.DeviceMemory.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.DeviceMemory} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.DeviceMemory.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getName();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getSize();
  if (f !== 0) {
    writer.writeUint64(
      2,
      f
    );
  }
};


/**
 * optional string name = 1;
 * @return {string}
 */
proto.packs.DeviceMemory.prototype.getName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.DeviceMemory} returns this
 */
proto.packs.DeviceMemory.prototype.setName = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional uint64 size = 2;
 * @return {number}
 */
proto.packs.DeviceMemory.prototype.getSize = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {number} value
 * @return {!proto.packs.DeviceMemory} returns this
 */
proto.packs.DeviceMemory.prototype.setSize = function(value) {
  return jspb.Message.setProto3IntField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.DeviceReference.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.DeviceReference.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.DeviceReference} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.DeviceReference.toObject = function(includeInstance, msg) {
  var f, obj = {
    name: jspb.Message.getFieldWithDefault(msg, 1, ""),
    vendor: jspb.Message.getFieldWithDefault(msg, 2, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.DeviceReference}
 */
proto.packs.DeviceReference.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.DeviceReference;
  return proto.packs.DeviceReference.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.DeviceReference} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.DeviceReference}
 */
proto.packs.DeviceReference.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setName(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setVendor(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.DeviceReference.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.DeviceReference.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.DeviceReference} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.DeviceReference.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getName();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getVendor();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
};


/**
 * optional string name = 1;
 * @return {string}
 */
proto.packs.DeviceReference.prototype.getName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.DeviceReference} returns this
 */
proto.packs.DeviceReference.prototype.setName = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string vendor = 2;
 * @return {string}
 */
proto.packs.DeviceReference.prototype.getVendor = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.DeviceReference} returns this
 */
proto.packs.DeviceReference.prototype.setVendor = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.packs.DeviceFamilyInfo.repeatedFields_ = [4,5];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.DeviceFamilyInfo.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.DeviceFamilyInfo.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.DeviceFamilyInfo} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.DeviceFamilyInfo.toObject = function(includeInstance, msg) {
  var f, obj = {
    deviceFamily: (f = msg.getDeviceFamily()) && proto.packs.DeviceReference.toObject(includeInstance, f),
    packId: (f = msg.getPackId()) && proto.packs.PackId.toObject(includeInstance, f),
    description: jspb.Message.getFieldWithDefault(msg, 3, ""),
    processorsList: jspb.Message.toObjectList(msg.getProcessorsList(),
    proto.packs.Processor.toObject, includeInstance),
    memoryList: jspb.Message.toObjectList(msg.getMemoryList(),
    proto.packs.DeviceMemory.toObject, includeInstance)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.DeviceFamilyInfo}
 */
proto.packs.DeviceFamilyInfo.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.DeviceFamilyInfo;
  return proto.packs.DeviceFamilyInfo.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.DeviceFamilyInfo} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.DeviceFamilyInfo}
 */
proto.packs.DeviceFamilyInfo.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.DeviceReference;
      reader.readMessage(value,proto.packs.DeviceReference.deserializeBinaryFromReader);
      msg.setDeviceFamily(value);
      break;
    case 2:
      var value = new proto.packs.PackId;
      reader.readMessage(value,proto.packs.PackId.deserializeBinaryFromReader);
      msg.setPackId(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setDescription(value);
      break;
    case 4:
      var value = new proto.packs.Processor;
      reader.readMessage(value,proto.packs.Processor.deserializeBinaryFromReader);
      msg.addProcessors(value);
      break;
    case 5:
      var value = new proto.packs.DeviceMemory;
      reader.readMessage(value,proto.packs.DeviceMemory.deserializeBinaryFromReader);
      msg.addMemory(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.DeviceFamilyInfo.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.DeviceFamilyInfo.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.DeviceFamilyInfo} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.DeviceFamilyInfo.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getDeviceFamily();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.packs.DeviceReference.serializeBinaryToWriter
    );
  }
  f = message.getPackId();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.packs.PackId.serializeBinaryToWriter
    );
  }
  f = message.getDescription();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getProcessorsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      4,
      f,
      proto.packs.Processor.serializeBinaryToWriter
    );
  }
  f = message.getMemoryList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      5,
      f,
      proto.packs.DeviceMemory.serializeBinaryToWriter
    );
  }
};


/**
 * optional DeviceReference device_family = 1;
 * @return {?proto.packs.DeviceReference}
 */
proto.packs.DeviceFamilyInfo.prototype.getDeviceFamily = function() {
  return /** @type{?proto.packs.DeviceReference} */ (
    jspb.Message.getWrapperField(this, proto.packs.DeviceReference, 1));
};


/**
 * @param {?proto.packs.DeviceReference|undefined} value
 * @return {!proto.packs.DeviceFamilyInfo} returns this
*/
proto.packs.DeviceFamilyInfo.prototype.setDeviceFamily = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.DeviceFamilyInfo} returns this
 */
proto.packs.DeviceFamilyInfo.prototype.clearDeviceFamily = function() {
  return this.setDeviceFamily(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.DeviceFamilyInfo.prototype.hasDeviceFamily = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional PackId pack_id = 2;
 * @return {?proto.packs.PackId}
 */
proto.packs.DeviceFamilyInfo.prototype.getPackId = function() {
  return /** @type{?proto.packs.PackId} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackId, 2));
};


/**
 * @param {?proto.packs.PackId|undefined} value
 * @return {!proto.packs.DeviceFamilyInfo} returns this
*/
proto.packs.DeviceFamilyInfo.prototype.setPackId = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.DeviceFamilyInfo} returns this
 */
proto.packs.DeviceFamilyInfo.prototype.clearPackId = function() {
  return this.setPackId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.DeviceFamilyInfo.prototype.hasPackId = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional string description = 3;
 * @return {string}
 */
proto.packs.DeviceFamilyInfo.prototype.getDescription = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.DeviceFamilyInfo} returns this
 */
proto.packs.DeviceFamilyInfo.prototype.setDescription = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * repeated Processor processors = 4;
 * @return {!Array<!proto.packs.Processor>}
 */
proto.packs.DeviceFamilyInfo.prototype.getProcessorsList = function() {
  return /** @type{!Array<!proto.packs.Processor>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.packs.Processor, 4));
};


/**
 * @param {!Array<!proto.packs.Processor>} value
 * @return {!proto.packs.DeviceFamilyInfo} returns this
*/
proto.packs.DeviceFamilyInfo.prototype.setProcessorsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 4, value);
};


/**
 * @param {!proto.packs.Processor=} opt_value
 * @param {number=} opt_index
 * @return {!proto.packs.Processor}
 */
proto.packs.DeviceFamilyInfo.prototype.addProcessors = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 4, opt_value, proto.packs.Processor, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.DeviceFamilyInfo} returns this
 */
proto.packs.DeviceFamilyInfo.prototype.clearProcessorsList = function() {
  return this.setProcessorsList([]);
};


/**
 * repeated DeviceMemory memory = 5;
 * @return {!Array<!proto.packs.DeviceMemory>}
 */
proto.packs.DeviceFamilyInfo.prototype.getMemoryList = function() {
  return /** @type{!Array<!proto.packs.DeviceMemory>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.packs.DeviceMemory, 5));
};


/**
 * @param {!Array<!proto.packs.DeviceMemory>} value
 * @return {!proto.packs.DeviceFamilyInfo} returns this
*/
proto.packs.DeviceFamilyInfo.prototype.setMemoryList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 5, value);
};


/**
 * @param {!proto.packs.DeviceMemory=} opt_value
 * @param {number=} opt_index
 * @return {!proto.packs.DeviceMemory}
 */
proto.packs.DeviceFamilyInfo.prototype.addMemory = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 5, opt_value, proto.packs.DeviceMemory, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.DeviceFamilyInfo} returns this
 */
proto.packs.DeviceFamilyInfo.prototype.clearMemoryList = function() {
  return this.setMemoryList([]);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.packs.DeviceSubFamilyInfo.repeatedFields_ = [5,6];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.DeviceSubFamilyInfo.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.DeviceSubFamilyInfo.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.DeviceSubFamilyInfo} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.DeviceSubFamilyInfo.toObject = function(includeInstance, msg) {
  var f, obj = {
    deviceSubFamily: (f = msg.getDeviceSubFamily()) && proto.packs.DeviceReference.toObject(includeInstance, f),
    deviceFamily: (f = msg.getDeviceFamily()) && proto.packs.DeviceReference.toObject(includeInstance, f),
    packId: (f = msg.getPackId()) && proto.packs.PackId.toObject(includeInstance, f),
    description: jspb.Message.getFieldWithDefault(msg, 4, ""),
    processorsList: jspb.Message.toObjectList(msg.getProcessorsList(),
    proto.packs.Processor.toObject, includeInstance),
    memoryList: jspb.Message.toObjectList(msg.getMemoryList(),
    proto.packs.DeviceMemory.toObject, includeInstance)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.DeviceSubFamilyInfo}
 */
proto.packs.DeviceSubFamilyInfo.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.DeviceSubFamilyInfo;
  return proto.packs.DeviceSubFamilyInfo.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.DeviceSubFamilyInfo} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.DeviceSubFamilyInfo}
 */
proto.packs.DeviceSubFamilyInfo.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.DeviceReference;
      reader.readMessage(value,proto.packs.DeviceReference.deserializeBinaryFromReader);
      msg.setDeviceSubFamily(value);
      break;
    case 2:
      var value = new proto.packs.DeviceReference;
      reader.readMessage(value,proto.packs.DeviceReference.deserializeBinaryFromReader);
      msg.setDeviceFamily(value);
      break;
    case 3:
      var value = new proto.packs.PackId;
      reader.readMessage(value,proto.packs.PackId.deserializeBinaryFromReader);
      msg.setPackId(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setDescription(value);
      break;
    case 5:
      var value = new proto.packs.Processor;
      reader.readMessage(value,proto.packs.Processor.deserializeBinaryFromReader);
      msg.addProcessors(value);
      break;
    case 6:
      var value = new proto.packs.DeviceMemory;
      reader.readMessage(value,proto.packs.DeviceMemory.deserializeBinaryFromReader);
      msg.addMemory(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.DeviceSubFamilyInfo.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.DeviceSubFamilyInfo.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.DeviceSubFamilyInfo} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.DeviceSubFamilyInfo.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getDeviceSubFamily();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.packs.DeviceReference.serializeBinaryToWriter
    );
  }
  f = message.getDeviceFamily();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.packs.DeviceReference.serializeBinaryToWriter
    );
  }
  f = message.getPackId();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.packs.PackId.serializeBinaryToWriter
    );
  }
  f = message.getDescription();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getProcessorsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      5,
      f,
      proto.packs.Processor.serializeBinaryToWriter
    );
  }
  f = message.getMemoryList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      6,
      f,
      proto.packs.DeviceMemory.serializeBinaryToWriter
    );
  }
};


/**
 * optional DeviceReference device_sub_family = 1;
 * @return {?proto.packs.DeviceReference}
 */
proto.packs.DeviceSubFamilyInfo.prototype.getDeviceSubFamily = function() {
  return /** @type{?proto.packs.DeviceReference} */ (
    jspb.Message.getWrapperField(this, proto.packs.DeviceReference, 1));
};


/**
 * @param {?proto.packs.DeviceReference|undefined} value
 * @return {!proto.packs.DeviceSubFamilyInfo} returns this
*/
proto.packs.DeviceSubFamilyInfo.prototype.setDeviceSubFamily = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.DeviceSubFamilyInfo} returns this
 */
proto.packs.DeviceSubFamilyInfo.prototype.clearDeviceSubFamily = function() {
  return this.setDeviceSubFamily(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.DeviceSubFamilyInfo.prototype.hasDeviceSubFamily = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional DeviceReference device_family = 2;
 * @return {?proto.packs.DeviceReference}
 */
proto.packs.DeviceSubFamilyInfo.prototype.getDeviceFamily = function() {
  return /** @type{?proto.packs.DeviceReference} */ (
    jspb.Message.getWrapperField(this, proto.packs.DeviceReference, 2));
};


/**
 * @param {?proto.packs.DeviceReference|undefined} value
 * @return {!proto.packs.DeviceSubFamilyInfo} returns this
*/
proto.packs.DeviceSubFamilyInfo.prototype.setDeviceFamily = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.DeviceSubFamilyInfo} returns this
 */
proto.packs.DeviceSubFamilyInfo.prototype.clearDeviceFamily = function() {
  return this.setDeviceFamily(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.DeviceSubFamilyInfo.prototype.hasDeviceFamily = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional PackId pack_id = 3;
 * @return {?proto.packs.PackId}
 */
proto.packs.DeviceSubFamilyInfo.prototype.getPackId = function() {
  return /** @type{?proto.packs.PackId} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackId, 3));
};


/**
 * @param {?proto.packs.PackId|undefined} value
 * @return {!proto.packs.DeviceSubFamilyInfo} returns this
*/
proto.packs.DeviceSubFamilyInfo.prototype.setPackId = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.DeviceSubFamilyInfo} returns this
 */
proto.packs.DeviceSubFamilyInfo.prototype.clearPackId = function() {
  return this.setPackId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.DeviceSubFamilyInfo.prototype.hasPackId = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional string description = 4;
 * @return {string}
 */
proto.packs.DeviceSubFamilyInfo.prototype.getDescription = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.DeviceSubFamilyInfo} returns this
 */
proto.packs.DeviceSubFamilyInfo.prototype.setDescription = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * repeated Processor processors = 5;
 * @return {!Array<!proto.packs.Processor>}
 */
proto.packs.DeviceSubFamilyInfo.prototype.getProcessorsList = function() {
  return /** @type{!Array<!proto.packs.Processor>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.packs.Processor, 5));
};


/**
 * @param {!Array<!proto.packs.Processor>} value
 * @return {!proto.packs.DeviceSubFamilyInfo} returns this
*/
proto.packs.DeviceSubFamilyInfo.prototype.setProcessorsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 5, value);
};


/**
 * @param {!proto.packs.Processor=} opt_value
 * @param {number=} opt_index
 * @return {!proto.packs.Processor}
 */
proto.packs.DeviceSubFamilyInfo.prototype.addProcessors = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 5, opt_value, proto.packs.Processor, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.DeviceSubFamilyInfo} returns this
 */
proto.packs.DeviceSubFamilyInfo.prototype.clearProcessorsList = function() {
  return this.setProcessorsList([]);
};


/**
 * repeated DeviceMemory memory = 6;
 * @return {!Array<!proto.packs.DeviceMemory>}
 */
proto.packs.DeviceSubFamilyInfo.prototype.getMemoryList = function() {
  return /** @type{!Array<!proto.packs.DeviceMemory>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.packs.DeviceMemory, 6));
};


/**
 * @param {!Array<!proto.packs.DeviceMemory>} value
 * @return {!proto.packs.DeviceSubFamilyInfo} returns this
*/
proto.packs.DeviceSubFamilyInfo.prototype.setMemoryList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 6, value);
};


/**
 * @param {!proto.packs.DeviceMemory=} opt_value
 * @param {number=} opt_index
 * @return {!proto.packs.DeviceMemory}
 */
proto.packs.DeviceSubFamilyInfo.prototype.addMemory = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 6, opt_value, proto.packs.DeviceMemory, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.DeviceSubFamilyInfo} returns this
 */
proto.packs.DeviceSubFamilyInfo.prototype.clearMemoryList = function() {
  return this.setMemoryList([]);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.packs.DeviceGroupInfo.repeatedFields_ = [6,7];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.DeviceGroupInfo.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.DeviceGroupInfo.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.DeviceGroupInfo} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.DeviceGroupInfo.toObject = function(includeInstance, msg) {
  var f, obj = {
    deviceGroup: (f = msg.getDeviceGroup()) && proto.packs.DeviceReference.toObject(includeInstance, f),
    deviceSubFamily: (f = msg.getDeviceSubFamily()) && proto.packs.DeviceReference.toObject(includeInstance, f),
    deviceFamily: (f = msg.getDeviceFamily()) && proto.packs.DeviceReference.toObject(includeInstance, f),
    packId: (f = msg.getPackId()) && proto.packs.PackId.toObject(includeInstance, f),
    description: jspb.Message.getFieldWithDefault(msg, 5, ""),
    processorsList: jspb.Message.toObjectList(msg.getProcessorsList(),
    proto.packs.Processor.toObject, includeInstance),
    memoryList: jspb.Message.toObjectList(msg.getMemoryList(),
    proto.packs.DeviceMemory.toObject, includeInstance)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.DeviceGroupInfo}
 */
proto.packs.DeviceGroupInfo.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.DeviceGroupInfo;
  return proto.packs.DeviceGroupInfo.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.DeviceGroupInfo} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.DeviceGroupInfo}
 */
proto.packs.DeviceGroupInfo.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.DeviceReference;
      reader.readMessage(value,proto.packs.DeviceReference.deserializeBinaryFromReader);
      msg.setDeviceGroup(value);
      break;
    case 2:
      var value = new proto.packs.DeviceReference;
      reader.readMessage(value,proto.packs.DeviceReference.deserializeBinaryFromReader);
      msg.setDeviceSubFamily(value);
      break;
    case 3:
      var value = new proto.packs.DeviceReference;
      reader.readMessage(value,proto.packs.DeviceReference.deserializeBinaryFromReader);
      msg.setDeviceFamily(value);
      break;
    case 4:
      var value = new proto.packs.PackId;
      reader.readMessage(value,proto.packs.PackId.deserializeBinaryFromReader);
      msg.setPackId(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setDescription(value);
      break;
    case 6:
      var value = new proto.packs.Processor;
      reader.readMessage(value,proto.packs.Processor.deserializeBinaryFromReader);
      msg.addProcessors(value);
      break;
    case 7:
      var value = new proto.packs.DeviceMemory;
      reader.readMessage(value,proto.packs.DeviceMemory.deserializeBinaryFromReader);
      msg.addMemory(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.DeviceGroupInfo.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.DeviceGroupInfo.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.DeviceGroupInfo} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.DeviceGroupInfo.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getDeviceGroup();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.packs.DeviceReference.serializeBinaryToWriter
    );
  }
  f = message.getDeviceSubFamily();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.packs.DeviceReference.serializeBinaryToWriter
    );
  }
  f = message.getDeviceFamily();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.packs.DeviceReference.serializeBinaryToWriter
    );
  }
  f = message.getPackId();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.packs.PackId.serializeBinaryToWriter
    );
  }
  f = message.getDescription();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
  f = message.getProcessorsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      6,
      f,
      proto.packs.Processor.serializeBinaryToWriter
    );
  }
  f = message.getMemoryList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      7,
      f,
      proto.packs.DeviceMemory.serializeBinaryToWriter
    );
  }
};


/**
 * optional DeviceReference device_group = 1;
 * @return {?proto.packs.DeviceReference}
 */
proto.packs.DeviceGroupInfo.prototype.getDeviceGroup = function() {
  return /** @type{?proto.packs.DeviceReference} */ (
    jspb.Message.getWrapperField(this, proto.packs.DeviceReference, 1));
};


/**
 * @param {?proto.packs.DeviceReference|undefined} value
 * @return {!proto.packs.DeviceGroupInfo} returns this
*/
proto.packs.DeviceGroupInfo.prototype.setDeviceGroup = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.DeviceGroupInfo} returns this
 */
proto.packs.DeviceGroupInfo.prototype.clearDeviceGroup = function() {
  return this.setDeviceGroup(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.DeviceGroupInfo.prototype.hasDeviceGroup = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional DeviceReference device_sub_family = 2;
 * @return {?proto.packs.DeviceReference}
 */
proto.packs.DeviceGroupInfo.prototype.getDeviceSubFamily = function() {
  return /** @type{?proto.packs.DeviceReference} */ (
    jspb.Message.getWrapperField(this, proto.packs.DeviceReference, 2));
};


/**
 * @param {?proto.packs.DeviceReference|undefined} value
 * @return {!proto.packs.DeviceGroupInfo} returns this
*/
proto.packs.DeviceGroupInfo.prototype.setDeviceSubFamily = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.DeviceGroupInfo} returns this
 */
proto.packs.DeviceGroupInfo.prototype.clearDeviceSubFamily = function() {
  return this.setDeviceSubFamily(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.DeviceGroupInfo.prototype.hasDeviceSubFamily = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional DeviceReference device_family = 3;
 * @return {?proto.packs.DeviceReference}
 */
proto.packs.DeviceGroupInfo.prototype.getDeviceFamily = function() {
  return /** @type{?proto.packs.DeviceReference} */ (
    jspb.Message.getWrapperField(this, proto.packs.DeviceReference, 3));
};


/**
 * @param {?proto.packs.DeviceReference|undefined} value
 * @return {!proto.packs.DeviceGroupInfo} returns this
*/
proto.packs.DeviceGroupInfo.prototype.setDeviceFamily = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.DeviceGroupInfo} returns this
 */
proto.packs.DeviceGroupInfo.prototype.clearDeviceFamily = function() {
  return this.setDeviceFamily(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.DeviceGroupInfo.prototype.hasDeviceFamily = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional PackId pack_id = 4;
 * @return {?proto.packs.PackId}
 */
proto.packs.DeviceGroupInfo.prototype.getPackId = function() {
  return /** @type{?proto.packs.PackId} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackId, 4));
};


/**
 * @param {?proto.packs.PackId|undefined} value
 * @return {!proto.packs.DeviceGroupInfo} returns this
*/
proto.packs.DeviceGroupInfo.prototype.setPackId = function(value) {
  return jspb.Message.setWrapperField(this, 4, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.DeviceGroupInfo} returns this
 */
proto.packs.DeviceGroupInfo.prototype.clearPackId = function() {
  return this.setPackId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.DeviceGroupInfo.prototype.hasPackId = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional string description = 5;
 * @return {string}
 */
proto.packs.DeviceGroupInfo.prototype.getDescription = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.DeviceGroupInfo} returns this
 */
proto.packs.DeviceGroupInfo.prototype.setDescription = function(value) {
  return jspb.Message.setProto3StringField(this, 5, value);
};


/**
 * repeated Processor processors = 6;
 * @return {!Array<!proto.packs.Processor>}
 */
proto.packs.DeviceGroupInfo.prototype.getProcessorsList = function() {
  return /** @type{!Array<!proto.packs.Processor>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.packs.Processor, 6));
};


/**
 * @param {!Array<!proto.packs.Processor>} value
 * @return {!proto.packs.DeviceGroupInfo} returns this
*/
proto.packs.DeviceGroupInfo.prototype.setProcessorsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 6, value);
};


/**
 * @param {!proto.packs.Processor=} opt_value
 * @param {number=} opt_index
 * @return {!proto.packs.Processor}
 */
proto.packs.DeviceGroupInfo.prototype.addProcessors = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 6, opt_value, proto.packs.Processor, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.DeviceGroupInfo} returns this
 */
proto.packs.DeviceGroupInfo.prototype.clearProcessorsList = function() {
  return this.setProcessorsList([]);
};


/**
 * repeated DeviceMemory memory = 7;
 * @return {!Array<!proto.packs.DeviceMemory>}
 */
proto.packs.DeviceGroupInfo.prototype.getMemoryList = function() {
  return /** @type{!Array<!proto.packs.DeviceMemory>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.packs.DeviceMemory, 7));
};


/**
 * @param {!Array<!proto.packs.DeviceMemory>} value
 * @return {!proto.packs.DeviceGroupInfo} returns this
*/
proto.packs.DeviceGroupInfo.prototype.setMemoryList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 7, value);
};


/**
 * @param {!proto.packs.DeviceMemory=} opt_value
 * @param {number=} opt_index
 * @return {!proto.packs.DeviceMemory}
 */
proto.packs.DeviceGroupInfo.prototype.addMemory = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 7, opt_value, proto.packs.DeviceMemory, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.DeviceGroupInfo} returns this
 */
proto.packs.DeviceGroupInfo.prototype.clearMemoryList = function() {
  return this.setMemoryList([]);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.packs.DeviceInfo.repeatedFields_ = [7,8];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.DeviceInfo.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.DeviceInfo.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.DeviceInfo} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.DeviceInfo.toObject = function(includeInstance, msg) {
  var f, obj = {
    deviceId: (f = msg.getDeviceId()) && proto.packs.DeviceReference.toObject(includeInstance, f),
    deviceGroup: (f = msg.getDeviceGroup()) && proto.packs.DeviceReference.toObject(includeInstance, f),
    deviceSubFamily: (f = msg.getDeviceSubFamily()) && proto.packs.DeviceReference.toObject(includeInstance, f),
    deviceFamily: (f = msg.getDeviceFamily()) && proto.packs.DeviceReference.toObject(includeInstance, f),
    packId: (f = msg.getPackId()) && proto.packs.PackId.toObject(includeInstance, f),
    description: jspb.Message.getFieldWithDefault(msg, 6, ""),
    processorsList: jspb.Message.toObjectList(msg.getProcessorsList(),
    proto.packs.Processor.toObject, includeInstance),
    memoryList: jspb.Message.toObjectList(msg.getMemoryList(),
    proto.packs.DeviceMemory.toObject, includeInstance)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.DeviceInfo}
 */
proto.packs.DeviceInfo.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.DeviceInfo;
  return proto.packs.DeviceInfo.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.DeviceInfo} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.DeviceInfo}
 */
proto.packs.DeviceInfo.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.DeviceReference;
      reader.readMessage(value,proto.packs.DeviceReference.deserializeBinaryFromReader);
      msg.setDeviceId(value);
      break;
    case 2:
      var value = new proto.packs.DeviceReference;
      reader.readMessage(value,proto.packs.DeviceReference.deserializeBinaryFromReader);
      msg.setDeviceGroup(value);
      break;
    case 3:
      var value = new proto.packs.DeviceReference;
      reader.readMessage(value,proto.packs.DeviceReference.deserializeBinaryFromReader);
      msg.setDeviceSubFamily(value);
      break;
    case 4:
      var value = new proto.packs.DeviceReference;
      reader.readMessage(value,proto.packs.DeviceReference.deserializeBinaryFromReader);
      msg.setDeviceFamily(value);
      break;
    case 5:
      var value = new proto.packs.PackId;
      reader.readMessage(value,proto.packs.PackId.deserializeBinaryFromReader);
      msg.setPackId(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readString());
      msg.setDescription(value);
      break;
    case 7:
      var value = new proto.packs.Processor;
      reader.readMessage(value,proto.packs.Processor.deserializeBinaryFromReader);
      msg.addProcessors(value);
      break;
    case 8:
      var value = new proto.packs.DeviceMemory;
      reader.readMessage(value,proto.packs.DeviceMemory.deserializeBinaryFromReader);
      msg.addMemory(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.DeviceInfo.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.DeviceInfo.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.DeviceInfo} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.DeviceInfo.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getDeviceId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.packs.DeviceReference.serializeBinaryToWriter
    );
  }
  f = message.getDeviceGroup();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.packs.DeviceReference.serializeBinaryToWriter
    );
  }
  f = message.getDeviceSubFamily();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.packs.DeviceReference.serializeBinaryToWriter
    );
  }
  f = message.getDeviceFamily();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.packs.DeviceReference.serializeBinaryToWriter
    );
  }
  f = message.getPackId();
  if (f != null) {
    writer.writeMessage(
      5,
      f,
      proto.packs.PackId.serializeBinaryToWriter
    );
  }
  f = message.getDescription();
  if (f.length > 0) {
    writer.writeString(
      6,
      f
    );
  }
  f = message.getProcessorsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      7,
      f,
      proto.packs.Processor.serializeBinaryToWriter
    );
  }
  f = message.getMemoryList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      8,
      f,
      proto.packs.DeviceMemory.serializeBinaryToWriter
    );
  }
};


/**
 * optional DeviceReference device_id = 1;
 * @return {?proto.packs.DeviceReference}
 */
proto.packs.DeviceInfo.prototype.getDeviceId = function() {
  return /** @type{?proto.packs.DeviceReference} */ (
    jspb.Message.getWrapperField(this, proto.packs.DeviceReference, 1));
};


/**
 * @param {?proto.packs.DeviceReference|undefined} value
 * @return {!proto.packs.DeviceInfo} returns this
*/
proto.packs.DeviceInfo.prototype.setDeviceId = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.DeviceInfo} returns this
 */
proto.packs.DeviceInfo.prototype.clearDeviceId = function() {
  return this.setDeviceId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.DeviceInfo.prototype.hasDeviceId = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional DeviceReference device_group = 2;
 * @return {?proto.packs.DeviceReference}
 */
proto.packs.DeviceInfo.prototype.getDeviceGroup = function() {
  return /** @type{?proto.packs.DeviceReference} */ (
    jspb.Message.getWrapperField(this, proto.packs.DeviceReference, 2));
};


/**
 * @param {?proto.packs.DeviceReference|undefined} value
 * @return {!proto.packs.DeviceInfo} returns this
*/
proto.packs.DeviceInfo.prototype.setDeviceGroup = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.DeviceInfo} returns this
 */
proto.packs.DeviceInfo.prototype.clearDeviceGroup = function() {
  return this.setDeviceGroup(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.DeviceInfo.prototype.hasDeviceGroup = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional DeviceReference device_sub_family = 3;
 * @return {?proto.packs.DeviceReference}
 */
proto.packs.DeviceInfo.prototype.getDeviceSubFamily = function() {
  return /** @type{?proto.packs.DeviceReference} */ (
    jspb.Message.getWrapperField(this, proto.packs.DeviceReference, 3));
};


/**
 * @param {?proto.packs.DeviceReference|undefined} value
 * @return {!proto.packs.DeviceInfo} returns this
*/
proto.packs.DeviceInfo.prototype.setDeviceSubFamily = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.DeviceInfo} returns this
 */
proto.packs.DeviceInfo.prototype.clearDeviceSubFamily = function() {
  return this.setDeviceSubFamily(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.DeviceInfo.prototype.hasDeviceSubFamily = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional DeviceReference device_family = 4;
 * @return {?proto.packs.DeviceReference}
 */
proto.packs.DeviceInfo.prototype.getDeviceFamily = function() {
  return /** @type{?proto.packs.DeviceReference} */ (
    jspb.Message.getWrapperField(this, proto.packs.DeviceReference, 4));
};


/**
 * @param {?proto.packs.DeviceReference|undefined} value
 * @return {!proto.packs.DeviceInfo} returns this
*/
proto.packs.DeviceInfo.prototype.setDeviceFamily = function(value) {
  return jspb.Message.setWrapperField(this, 4, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.DeviceInfo} returns this
 */
proto.packs.DeviceInfo.prototype.clearDeviceFamily = function() {
  return this.setDeviceFamily(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.DeviceInfo.prototype.hasDeviceFamily = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional PackId pack_id = 5;
 * @return {?proto.packs.PackId}
 */
proto.packs.DeviceInfo.prototype.getPackId = function() {
  return /** @type{?proto.packs.PackId} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackId, 5));
};


/**
 * @param {?proto.packs.PackId|undefined} value
 * @return {!proto.packs.DeviceInfo} returns this
*/
proto.packs.DeviceInfo.prototype.setPackId = function(value) {
  return jspb.Message.setWrapperField(this, 5, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.DeviceInfo} returns this
 */
proto.packs.DeviceInfo.prototype.clearPackId = function() {
  return this.setPackId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.DeviceInfo.prototype.hasPackId = function() {
  return jspb.Message.getField(this, 5) != null;
};


/**
 * optional string description = 6;
 * @return {string}
 */
proto.packs.DeviceInfo.prototype.getDescription = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.DeviceInfo} returns this
 */
proto.packs.DeviceInfo.prototype.setDescription = function(value) {
  return jspb.Message.setProto3StringField(this, 6, value);
};


/**
 * repeated Processor processors = 7;
 * @return {!Array<!proto.packs.Processor>}
 */
proto.packs.DeviceInfo.prototype.getProcessorsList = function() {
  return /** @type{!Array<!proto.packs.Processor>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.packs.Processor, 7));
};


/**
 * @param {!Array<!proto.packs.Processor>} value
 * @return {!proto.packs.DeviceInfo} returns this
*/
proto.packs.DeviceInfo.prototype.setProcessorsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 7, value);
};


/**
 * @param {!proto.packs.Processor=} opt_value
 * @param {number=} opt_index
 * @return {!proto.packs.Processor}
 */
proto.packs.DeviceInfo.prototype.addProcessors = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 7, opt_value, proto.packs.Processor, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.DeviceInfo} returns this
 */
proto.packs.DeviceInfo.prototype.clearProcessorsList = function() {
  return this.setProcessorsList([]);
};


/**
 * repeated DeviceMemory memory = 8;
 * @return {!Array<!proto.packs.DeviceMemory>}
 */
proto.packs.DeviceInfo.prototype.getMemoryList = function() {
  return /** @type{!Array<!proto.packs.DeviceMemory>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.packs.DeviceMemory, 8));
};


/**
 * @param {!Array<!proto.packs.DeviceMemory>} value
 * @return {!proto.packs.DeviceInfo} returns this
*/
proto.packs.DeviceInfo.prototype.setMemoryList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 8, value);
};


/**
 * @param {!proto.packs.DeviceMemory=} opt_value
 * @param {number=} opt_index
 * @return {!proto.packs.DeviceMemory}
 */
proto.packs.DeviceInfo.prototype.addMemory = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 8, opt_value, proto.packs.DeviceMemory, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.DeviceInfo} returns this
 */
proto.packs.DeviceInfo.prototype.clearMemoryList = function() {
  return this.setMemoryList([]);
};



/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.packs.DeviceEntryInfo.oneofGroups_ = [[1,2,3,4]];

/**
 * @enum {number}
 */
proto.packs.DeviceEntryInfo.EntryCase = {
  ENTRY_NOT_SET: 0,
  DEVICE_FAMILY: 1,
  DEVICE_SUB_FAMILY: 2,
  DEVICE_GROUP: 3,
  DEVICE: 4
};

/**
 * @return {proto.packs.DeviceEntryInfo.EntryCase}
 */
proto.packs.DeviceEntryInfo.prototype.getEntryCase = function() {
  return /** @type {proto.packs.DeviceEntryInfo.EntryCase} */(jspb.Message.computeOneofCase(this, proto.packs.DeviceEntryInfo.oneofGroups_[0]));
};



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.DeviceEntryInfo.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.DeviceEntryInfo.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.DeviceEntryInfo} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.DeviceEntryInfo.toObject = function(includeInstance, msg) {
  var f, obj = {
    deviceFamily: (f = msg.getDeviceFamily()) && proto.packs.DeviceFamilyInfo.toObject(includeInstance, f),
    deviceSubFamily: (f = msg.getDeviceSubFamily()) && proto.packs.DeviceSubFamilyInfo.toObject(includeInstance, f),
    deviceGroup: (f = msg.getDeviceGroup()) && proto.packs.DeviceGroupInfo.toObject(includeInstance, f),
    device: (f = msg.getDevice()) && proto.packs.DeviceInfo.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.DeviceEntryInfo}
 */
proto.packs.DeviceEntryInfo.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.DeviceEntryInfo;
  return proto.packs.DeviceEntryInfo.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.DeviceEntryInfo} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.DeviceEntryInfo}
 */
proto.packs.DeviceEntryInfo.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.DeviceFamilyInfo;
      reader.readMessage(value,proto.packs.DeviceFamilyInfo.deserializeBinaryFromReader);
      msg.setDeviceFamily(value);
      break;
    case 2:
      var value = new proto.packs.DeviceSubFamilyInfo;
      reader.readMessage(value,proto.packs.DeviceSubFamilyInfo.deserializeBinaryFromReader);
      msg.setDeviceSubFamily(value);
      break;
    case 3:
      var value = new proto.packs.DeviceGroupInfo;
      reader.readMessage(value,proto.packs.DeviceGroupInfo.deserializeBinaryFromReader);
      msg.setDeviceGroup(value);
      break;
    case 4:
      var value = new proto.packs.DeviceInfo;
      reader.readMessage(value,proto.packs.DeviceInfo.deserializeBinaryFromReader);
      msg.setDevice(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.DeviceEntryInfo.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.DeviceEntryInfo.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.DeviceEntryInfo} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.DeviceEntryInfo.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getDeviceFamily();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.packs.DeviceFamilyInfo.serializeBinaryToWriter
    );
  }
  f = message.getDeviceSubFamily();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.packs.DeviceSubFamilyInfo.serializeBinaryToWriter
    );
  }
  f = message.getDeviceGroup();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.packs.DeviceGroupInfo.serializeBinaryToWriter
    );
  }
  f = message.getDevice();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.packs.DeviceInfo.serializeBinaryToWriter
    );
  }
};


/**
 * optional DeviceFamilyInfo device_family = 1;
 * @return {?proto.packs.DeviceFamilyInfo}
 */
proto.packs.DeviceEntryInfo.prototype.getDeviceFamily = function() {
  return /** @type{?proto.packs.DeviceFamilyInfo} */ (
    jspb.Message.getWrapperField(this, proto.packs.DeviceFamilyInfo, 1));
};


/**
 * @param {?proto.packs.DeviceFamilyInfo|undefined} value
 * @return {!proto.packs.DeviceEntryInfo} returns this
*/
proto.packs.DeviceEntryInfo.prototype.setDeviceFamily = function(value) {
  return jspb.Message.setOneofWrapperField(this, 1, proto.packs.DeviceEntryInfo.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.DeviceEntryInfo} returns this
 */
proto.packs.DeviceEntryInfo.prototype.clearDeviceFamily = function() {
  return this.setDeviceFamily(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.DeviceEntryInfo.prototype.hasDeviceFamily = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional DeviceSubFamilyInfo device_sub_family = 2;
 * @return {?proto.packs.DeviceSubFamilyInfo}
 */
proto.packs.DeviceEntryInfo.prototype.getDeviceSubFamily = function() {
  return /** @type{?proto.packs.DeviceSubFamilyInfo} */ (
    jspb.Message.getWrapperField(this, proto.packs.DeviceSubFamilyInfo, 2));
};


/**
 * @param {?proto.packs.DeviceSubFamilyInfo|undefined} value
 * @return {!proto.packs.DeviceEntryInfo} returns this
*/
proto.packs.DeviceEntryInfo.prototype.setDeviceSubFamily = function(value) {
  return jspb.Message.setOneofWrapperField(this, 2, proto.packs.DeviceEntryInfo.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.DeviceEntryInfo} returns this
 */
proto.packs.DeviceEntryInfo.prototype.clearDeviceSubFamily = function() {
  return this.setDeviceSubFamily(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.DeviceEntryInfo.prototype.hasDeviceSubFamily = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional DeviceGroupInfo device_group = 3;
 * @return {?proto.packs.DeviceGroupInfo}
 */
proto.packs.DeviceEntryInfo.prototype.getDeviceGroup = function() {
  return /** @type{?proto.packs.DeviceGroupInfo} */ (
    jspb.Message.getWrapperField(this, proto.packs.DeviceGroupInfo, 3));
};


/**
 * @param {?proto.packs.DeviceGroupInfo|undefined} value
 * @return {!proto.packs.DeviceEntryInfo} returns this
*/
proto.packs.DeviceEntryInfo.prototype.setDeviceGroup = function(value) {
  return jspb.Message.setOneofWrapperField(this, 3, proto.packs.DeviceEntryInfo.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.DeviceEntryInfo} returns this
 */
proto.packs.DeviceEntryInfo.prototype.clearDeviceGroup = function() {
  return this.setDeviceGroup(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.DeviceEntryInfo.prototype.hasDeviceGroup = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional DeviceInfo device = 4;
 * @return {?proto.packs.DeviceInfo}
 */
proto.packs.DeviceEntryInfo.prototype.getDevice = function() {
  return /** @type{?proto.packs.DeviceInfo} */ (
    jspb.Message.getWrapperField(this, proto.packs.DeviceInfo, 4));
};


/**
 * @param {?proto.packs.DeviceInfo|undefined} value
 * @return {!proto.packs.DeviceEntryInfo} returns this
*/
proto.packs.DeviceEntryInfo.prototype.setDevice = function(value) {
  return jspb.Message.setOneofWrapperField(this, 4, proto.packs.DeviceEntryInfo.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.DeviceEntryInfo} returns this
 */
proto.packs.DeviceEntryInfo.prototype.clearDevice = function() {
  return this.setDevice(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.DeviceEntryInfo.prototype.hasDevice = function() {
  return jspb.Message.getField(this, 4) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.Book.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.Book.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.Book} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.Book.toObject = function(includeInstance, msg) {
  var f, obj = {
    title: jspb.Message.getFieldWithDefault(msg, 1, ""),
    category: jspb.Message.getFieldWithDefault(msg, 2, ""),
    file: (f = msg.getFile()) && proto.packs.AssetReference.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.Book}
 */
proto.packs.Book.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.Book;
  return proto.packs.Book.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.Book} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.Book}
 */
proto.packs.Book.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setTitle(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setCategory(value);
      break;
    case 3:
      var value = new proto.packs.AssetReference;
      reader.readMessage(value,proto.packs.AssetReference.deserializeBinaryFromReader);
      msg.setFile(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.Book.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.Book.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.Book} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.Book.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTitle();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getCategory();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getFile();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.packs.AssetReference.serializeBinaryToWriter
    );
  }
};


/**
 * optional string title = 1;
 * @return {string}
 */
proto.packs.Book.prototype.getTitle = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.Book} returns this
 */
proto.packs.Book.prototype.setTitle = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string category = 2;
 * @return {string}
 */
proto.packs.Book.prototype.getCategory = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.Book} returns this
 */
proto.packs.Book.prototype.setCategory = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional AssetReference file = 3;
 * @return {?proto.packs.AssetReference}
 */
proto.packs.Book.prototype.getFile = function() {
  return /** @type{?proto.packs.AssetReference} */ (
    jspb.Message.getWrapperField(this, proto.packs.AssetReference, 3));
};


/**
 * @param {?proto.packs.AssetReference|undefined} value
 * @return {!proto.packs.Book} returns this
*/
proto.packs.Book.prototype.setFile = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.Book} returns this
 */
proto.packs.Book.prototype.clearFile = function() {
  return this.setFile(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.Book.prototype.hasFile = function() {
  return jspb.Message.getField(this, 3) != null;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.packs.BoardInfo.repeatedFields_ = [5,6,7,8,10,11];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.BoardInfo.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.BoardInfo.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.BoardInfo} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.BoardInfo.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: (f = msg.getId()) && proto.packs.BoardId.toObject(includeInstance, f),
    isDeprecated: jspb.Message.getBooleanFieldWithDefault(msg, 2, false),
    summary: jspb.Message.getFieldWithDefault(msg, 3, ""),
    description: jspb.Message.getFieldWithDefault(msg, 4, ""),
    featuresList: jspb.Message.toObjectList(msg.getFeaturesList(),
    proto.packs.BoardFeature.toObject, includeInstance),
    mountedDevicesList: jspb.Message.toObjectList(msg.getMountedDevicesList(),
    proto.packs.DeviceReference.toObject, includeInstance),
    examplesList: jspb.Message.toObjectList(msg.getExamplesList(),
    proto.packs.ExampleId.toObject, includeInstance),
    debugInterfacesList: jspb.Message.toObjectList(msg.getDebugInterfacesList(),
    proto.packs.DebugInterface.toObject, includeInstance),
    image: (f = msg.getImage()) && proto.packs.BoardImage.toObject(includeInstance, f),
    booksList: jspb.Message.toObjectList(msg.getBooksList(),
    proto.packs.Book.toObject, includeInstance),
    compatibleDevicesList: jspb.Message.toObjectList(msg.getCompatibleDevicesList(),
    proto.packs.DeviceReference.toObject, includeInstance),
    pack: (f = msg.getPack()) && proto.packs.PackId.toObject(includeInstance, f),
    uuid: jspb.Message.getFieldWithDefault(msg, 13, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.BoardInfo}
 */
proto.packs.BoardInfo.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.BoardInfo;
  return proto.packs.BoardInfo.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.BoardInfo} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.BoardInfo}
 */
proto.packs.BoardInfo.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.BoardId;
      reader.readMessage(value,proto.packs.BoardId.deserializeBinaryFromReader);
      msg.setId(value);
      break;
    case 2:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setIsDeprecated(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setSummary(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setDescription(value);
      break;
    case 5:
      var value = new proto.packs.BoardFeature;
      reader.readMessage(value,proto.packs.BoardFeature.deserializeBinaryFromReader);
      msg.addFeatures(value);
      break;
    case 6:
      var value = new proto.packs.DeviceReference;
      reader.readMessage(value,proto.packs.DeviceReference.deserializeBinaryFromReader);
      msg.addMountedDevices(value);
      break;
    case 7:
      var value = new proto.packs.ExampleId;
      reader.readMessage(value,proto.packs.ExampleId.deserializeBinaryFromReader);
      msg.addExamples(value);
      break;
    case 8:
      var value = new proto.packs.DebugInterface;
      reader.readMessage(value,proto.packs.DebugInterface.deserializeBinaryFromReader);
      msg.addDebugInterfaces(value);
      break;
    case 9:
      var value = new proto.packs.BoardImage;
      reader.readMessage(value,proto.packs.BoardImage.deserializeBinaryFromReader);
      msg.setImage(value);
      break;
    case 10:
      var value = new proto.packs.Book;
      reader.readMessage(value,proto.packs.Book.deserializeBinaryFromReader);
      msg.addBooks(value);
      break;
    case 11:
      var value = new proto.packs.DeviceReference;
      reader.readMessage(value,proto.packs.DeviceReference.deserializeBinaryFromReader);
      msg.addCompatibleDevices(value);
      break;
    case 12:
      var value = new proto.packs.PackId;
      reader.readMessage(value,proto.packs.PackId.deserializeBinaryFromReader);
      msg.setPack(value);
      break;
    case 13:
      var value = /** @type {string} */ (reader.readString());
      msg.setUuid(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.BoardInfo.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.BoardInfo.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.BoardInfo} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.BoardInfo.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.packs.BoardId.serializeBinaryToWriter
    );
  }
  f = message.getIsDeprecated();
  if (f) {
    writer.writeBool(
      2,
      f
    );
  }
  f = message.getSummary();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getDescription();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getFeaturesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      5,
      f,
      proto.packs.BoardFeature.serializeBinaryToWriter
    );
  }
  f = message.getMountedDevicesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      6,
      f,
      proto.packs.DeviceReference.serializeBinaryToWriter
    );
  }
  f = message.getExamplesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      7,
      f,
      proto.packs.ExampleId.serializeBinaryToWriter
    );
  }
  f = message.getDebugInterfacesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      8,
      f,
      proto.packs.DebugInterface.serializeBinaryToWriter
    );
  }
  f = message.getImage();
  if (f != null) {
    writer.writeMessage(
      9,
      f,
      proto.packs.BoardImage.serializeBinaryToWriter
    );
  }
  f = message.getBooksList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      10,
      f,
      proto.packs.Book.serializeBinaryToWriter
    );
  }
  f = message.getCompatibleDevicesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      11,
      f,
      proto.packs.DeviceReference.serializeBinaryToWriter
    );
  }
  f = message.getPack();
  if (f != null) {
    writer.writeMessage(
      12,
      f,
      proto.packs.PackId.serializeBinaryToWriter
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 13));
  if (f != null) {
    writer.writeString(
      13,
      f
    );
  }
};


/**
 * optional BoardId id = 1;
 * @return {?proto.packs.BoardId}
 */
proto.packs.BoardInfo.prototype.getId = function() {
  return /** @type{?proto.packs.BoardId} */ (
    jspb.Message.getWrapperField(this, proto.packs.BoardId, 1));
};


/**
 * @param {?proto.packs.BoardId|undefined} value
 * @return {!proto.packs.BoardInfo} returns this
*/
proto.packs.BoardInfo.prototype.setId = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.BoardInfo} returns this
 */
proto.packs.BoardInfo.prototype.clearId = function() {
  return this.setId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.BoardInfo.prototype.hasId = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional bool is_deprecated = 2;
 * @return {boolean}
 */
proto.packs.BoardInfo.prototype.getIsDeprecated = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 2, false));
};


/**
 * @param {boolean} value
 * @return {!proto.packs.BoardInfo} returns this
 */
proto.packs.BoardInfo.prototype.setIsDeprecated = function(value) {
  return jspb.Message.setProto3BooleanField(this, 2, value);
};


/**
 * optional string summary = 3;
 * @return {string}
 */
proto.packs.BoardInfo.prototype.getSummary = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.BoardInfo} returns this
 */
proto.packs.BoardInfo.prototype.setSummary = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string description = 4;
 * @return {string}
 */
proto.packs.BoardInfo.prototype.getDescription = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.BoardInfo} returns this
 */
proto.packs.BoardInfo.prototype.setDescription = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * repeated BoardFeature features = 5;
 * @return {!Array<!proto.packs.BoardFeature>}
 */
proto.packs.BoardInfo.prototype.getFeaturesList = function() {
  return /** @type{!Array<!proto.packs.BoardFeature>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.packs.BoardFeature, 5));
};


/**
 * @param {!Array<!proto.packs.BoardFeature>} value
 * @return {!proto.packs.BoardInfo} returns this
*/
proto.packs.BoardInfo.prototype.setFeaturesList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 5, value);
};


/**
 * @param {!proto.packs.BoardFeature=} opt_value
 * @param {number=} opt_index
 * @return {!proto.packs.BoardFeature}
 */
proto.packs.BoardInfo.prototype.addFeatures = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 5, opt_value, proto.packs.BoardFeature, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.BoardInfo} returns this
 */
proto.packs.BoardInfo.prototype.clearFeaturesList = function() {
  return this.setFeaturesList([]);
};


/**
 * repeated DeviceReference mounted_devices = 6;
 * @return {!Array<!proto.packs.DeviceReference>}
 */
proto.packs.BoardInfo.prototype.getMountedDevicesList = function() {
  return /** @type{!Array<!proto.packs.DeviceReference>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.packs.DeviceReference, 6));
};


/**
 * @param {!Array<!proto.packs.DeviceReference>} value
 * @return {!proto.packs.BoardInfo} returns this
*/
proto.packs.BoardInfo.prototype.setMountedDevicesList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 6, value);
};


/**
 * @param {!proto.packs.DeviceReference=} opt_value
 * @param {number=} opt_index
 * @return {!proto.packs.DeviceReference}
 */
proto.packs.BoardInfo.prototype.addMountedDevices = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 6, opt_value, proto.packs.DeviceReference, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.BoardInfo} returns this
 */
proto.packs.BoardInfo.prototype.clearMountedDevicesList = function() {
  return this.setMountedDevicesList([]);
};


/**
 * repeated ExampleId examples = 7;
 * @return {!Array<!proto.packs.ExampleId>}
 */
proto.packs.BoardInfo.prototype.getExamplesList = function() {
  return /** @type{!Array<!proto.packs.ExampleId>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.packs.ExampleId, 7));
};


/**
 * @param {!Array<!proto.packs.ExampleId>} value
 * @return {!proto.packs.BoardInfo} returns this
*/
proto.packs.BoardInfo.prototype.setExamplesList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 7, value);
};


/**
 * @param {!proto.packs.ExampleId=} opt_value
 * @param {number=} opt_index
 * @return {!proto.packs.ExampleId}
 */
proto.packs.BoardInfo.prototype.addExamples = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 7, opt_value, proto.packs.ExampleId, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.BoardInfo} returns this
 */
proto.packs.BoardInfo.prototype.clearExamplesList = function() {
  return this.setExamplesList([]);
};


/**
 * repeated DebugInterface debug_interfaces = 8;
 * @return {!Array<!proto.packs.DebugInterface>}
 */
proto.packs.BoardInfo.prototype.getDebugInterfacesList = function() {
  return /** @type{!Array<!proto.packs.DebugInterface>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.packs.DebugInterface, 8));
};


/**
 * @param {!Array<!proto.packs.DebugInterface>} value
 * @return {!proto.packs.BoardInfo} returns this
*/
proto.packs.BoardInfo.prototype.setDebugInterfacesList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 8, value);
};


/**
 * @param {!proto.packs.DebugInterface=} opt_value
 * @param {number=} opt_index
 * @return {!proto.packs.DebugInterface}
 */
proto.packs.BoardInfo.prototype.addDebugInterfaces = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 8, opt_value, proto.packs.DebugInterface, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.BoardInfo} returns this
 */
proto.packs.BoardInfo.prototype.clearDebugInterfacesList = function() {
  return this.setDebugInterfacesList([]);
};


/**
 * optional BoardImage image = 9;
 * @return {?proto.packs.BoardImage}
 */
proto.packs.BoardInfo.prototype.getImage = function() {
  return /** @type{?proto.packs.BoardImage} */ (
    jspb.Message.getWrapperField(this, proto.packs.BoardImage, 9));
};


/**
 * @param {?proto.packs.BoardImage|undefined} value
 * @return {!proto.packs.BoardInfo} returns this
*/
proto.packs.BoardInfo.prototype.setImage = function(value) {
  return jspb.Message.setWrapperField(this, 9, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.BoardInfo} returns this
 */
proto.packs.BoardInfo.prototype.clearImage = function() {
  return this.setImage(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.BoardInfo.prototype.hasImage = function() {
  return jspb.Message.getField(this, 9) != null;
};


/**
 * repeated Book books = 10;
 * @return {!Array<!proto.packs.Book>}
 */
proto.packs.BoardInfo.prototype.getBooksList = function() {
  return /** @type{!Array<!proto.packs.Book>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.packs.Book, 10));
};


/**
 * @param {!Array<!proto.packs.Book>} value
 * @return {!proto.packs.BoardInfo} returns this
*/
proto.packs.BoardInfo.prototype.setBooksList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 10, value);
};


/**
 * @param {!proto.packs.Book=} opt_value
 * @param {number=} opt_index
 * @return {!proto.packs.Book}
 */
proto.packs.BoardInfo.prototype.addBooks = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 10, opt_value, proto.packs.Book, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.BoardInfo} returns this
 */
proto.packs.BoardInfo.prototype.clearBooksList = function() {
  return this.setBooksList([]);
};


/**
 * repeated DeviceReference compatible_devices = 11;
 * @return {!Array<!proto.packs.DeviceReference>}
 */
proto.packs.BoardInfo.prototype.getCompatibleDevicesList = function() {
  return /** @type{!Array<!proto.packs.DeviceReference>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.packs.DeviceReference, 11));
};


/**
 * @param {!Array<!proto.packs.DeviceReference>} value
 * @return {!proto.packs.BoardInfo} returns this
*/
proto.packs.BoardInfo.prototype.setCompatibleDevicesList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 11, value);
};


/**
 * @param {!proto.packs.DeviceReference=} opt_value
 * @param {number=} opt_index
 * @return {!proto.packs.DeviceReference}
 */
proto.packs.BoardInfo.prototype.addCompatibleDevices = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 11, opt_value, proto.packs.DeviceReference, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.BoardInfo} returns this
 */
proto.packs.BoardInfo.prototype.clearCompatibleDevicesList = function() {
  return this.setCompatibleDevicesList([]);
};


/**
 * optional PackId pack = 12;
 * @return {?proto.packs.PackId}
 */
proto.packs.BoardInfo.prototype.getPack = function() {
  return /** @type{?proto.packs.PackId} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackId, 12));
};


/**
 * @param {?proto.packs.PackId|undefined} value
 * @return {!proto.packs.BoardInfo} returns this
*/
proto.packs.BoardInfo.prototype.setPack = function(value) {
  return jspb.Message.setWrapperField(this, 12, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.BoardInfo} returns this
 */
proto.packs.BoardInfo.prototype.clearPack = function() {
  return this.setPack(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.BoardInfo.prototype.hasPack = function() {
  return jspb.Message.getField(this, 12) != null;
};


/**
 * optional string uuid = 13;
 * @return {string}
 */
proto.packs.BoardInfo.prototype.getUuid = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 13, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.BoardInfo} returns this
 */
proto.packs.BoardInfo.prototype.setUuid = function(value) {
  return jspb.Message.setField(this, 13, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.packs.BoardInfo} returns this
 */
proto.packs.BoardInfo.prototype.clearUuid = function() {
  return jspb.Message.setField(this, 13, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.BoardInfo.prototype.hasUuid = function() {
  return jspb.Message.getField(this, 13) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.BoardFeatureDefaultNameMap.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.BoardFeatureDefaultNameMap.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.BoardFeatureDefaultNameMap} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.BoardFeatureDefaultNameMap.toObject = function(includeInstance, msg) {
  var f, obj = {
    defaultNamesMap: (f = msg.getDefaultNamesMap()) ? f.toObject(includeInstance, undefined) : []
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.BoardFeatureDefaultNameMap}
 */
proto.packs.BoardFeatureDefaultNameMap.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.BoardFeatureDefaultNameMap;
  return proto.packs.BoardFeatureDefaultNameMap.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.BoardFeatureDefaultNameMap} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.BoardFeatureDefaultNameMap}
 */
proto.packs.BoardFeatureDefaultNameMap.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = msg.getDefaultNamesMap();
      reader.readMessage(value, function(message, reader) {
        jspb.Map.deserializeBinary(message, reader, jspb.BinaryReader.prototype.readString, jspb.BinaryReader.prototype.readString, null, "", "");
         });
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.BoardFeatureDefaultNameMap.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.BoardFeatureDefaultNameMap.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.BoardFeatureDefaultNameMap} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.BoardFeatureDefaultNameMap.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getDefaultNamesMap(true);
  if (f && f.getLength() > 0) {
    f.serializeBinary(1, writer, jspb.BinaryWriter.prototype.writeString, jspb.BinaryWriter.prototype.writeString);
  }
};


/**
 * map<string, string> default_names = 1;
 * @param {boolean=} opt_noLazyCreate Do not create the map if
 * empty, instead returning `undefined`
 * @return {!jspb.Map<string,string>}
 */
proto.packs.BoardFeatureDefaultNameMap.prototype.getDefaultNamesMap = function(opt_noLazyCreate) {
  return /** @type {!jspb.Map<string,string>} */ (
      jspb.Message.getMapField(this, 1, opt_noLazyCreate,
      null));
};


/**
 * Clears values from the map. The map will be non-null.
 * @return {!proto.packs.BoardFeatureDefaultNameMap} returns this
 */
proto.packs.BoardFeatureDefaultNameMap.prototype.clearDefaultNamesMap = function() {
  this.getDefaultNamesMap().clear();
  return this;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.ExampleId.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.ExampleId.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.ExampleId} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ExampleId.toObject = function(includeInstance, msg) {
  var f, obj = {
    packId: (f = msg.getPackId()) && proto.packs.PackId.toObject(includeInstance, f),
    name: jspb.Message.getFieldWithDefault(msg, 2, ""),
    boardName: jspb.Message.getFieldWithDefault(msg, 3, ""),
    boardVendor: jspb.Message.getFieldWithDefault(msg, 4, ""),
    boardDeviceVendor: jspb.Message.getFieldWithDefault(msg, 5, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.ExampleId}
 */
proto.packs.ExampleId.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.ExampleId;
  return proto.packs.ExampleId.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.ExampleId} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.ExampleId}
 */
proto.packs.ExampleId.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.PackId;
      reader.readMessage(value,proto.packs.PackId.deserializeBinaryFromReader);
      msg.setPackId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setName(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setBoardName(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setBoardVendor(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setBoardDeviceVendor(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.ExampleId.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.ExampleId.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.ExampleId} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ExampleId.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPackId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.packs.PackId.serializeBinaryToWriter
    );
  }
  f = message.getName();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getBoardName();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getBoardVendor();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getBoardDeviceVendor();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
};


/**
 * optional PackId pack_id = 1;
 * @return {?proto.packs.PackId}
 */
proto.packs.ExampleId.prototype.getPackId = function() {
  return /** @type{?proto.packs.PackId} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackId, 1));
};


/**
 * @param {?proto.packs.PackId|undefined} value
 * @return {!proto.packs.ExampleId} returns this
*/
proto.packs.ExampleId.prototype.setPackId = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.ExampleId} returns this
 */
proto.packs.ExampleId.prototype.clearPackId = function() {
  return this.setPackId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ExampleId.prototype.hasPackId = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional string name = 2;
 * @return {string}
 */
proto.packs.ExampleId.prototype.getName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.ExampleId} returns this
 */
proto.packs.ExampleId.prototype.setName = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string board_name = 3;
 * @return {string}
 */
proto.packs.ExampleId.prototype.getBoardName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.ExampleId} returns this
 */
proto.packs.ExampleId.prototype.setBoardName = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string board_vendor = 4;
 * @return {string}
 */
proto.packs.ExampleId.prototype.getBoardVendor = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.ExampleId} returns this
 */
proto.packs.ExampleId.prototype.setBoardVendor = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional string board_device_vendor = 5;
 * @return {string}
 */
proto.packs.ExampleId.prototype.getBoardDeviceVendor = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.ExampleId} returns this
 */
proto.packs.ExampleId.prototype.setBoardDeviceVendor = function(value) {
  return jspb.Message.setProto3StringField(this, 5, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.packs.Example.repeatedFields_ = [5,6,7,8];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.Example.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.Example.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.Example} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.Example.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: (f = msg.getId()) && proto.packs.ExampleId.toObject(includeInstance, f),
    name: jspb.Message.getFieldWithDefault(msg, 2, ""),
    description: jspb.Message.getFieldWithDefault(msg, 3, ""),
    version: jspb.Message.getFieldWithDefault(msg, 4, ""),
    categoriesList: (f = jspb.Message.getRepeatedField(msg, 5)) == null ? undefined : f,
    componentsList: jspb.Message.toObjectList(msg.getComponentsList(),
    proto.packs.RelatedComponent.toObject, includeInstance),
    keywordsList: (f = jspb.Message.getRepeatedField(msg, 7)) == null ? undefined : f,
    environmentsList: jspb.Message.toObjectList(msg.getEnvironmentsList(),
    proto.packs.ExampleEnvironment.toObject, includeInstance),
    documentation: (f = msg.getDocumentation()) && proto.packs.AssetReference.toObject(includeInstance, f),
    pack: (f = msg.getPack()) && proto.packs.PackId.toObject(includeInstance, f),
    folder: (f = msg.getFolder()) && proto.packs.PackFileReference.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.Example}
 */
proto.packs.Example.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.Example;
  return proto.packs.Example.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.Example} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.Example}
 */
proto.packs.Example.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.ExampleId;
      reader.readMessage(value,proto.packs.ExampleId.deserializeBinaryFromReader);
      msg.setId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setName(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setDescription(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setVersion(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.addCategories(value);
      break;
    case 6:
      var value = new proto.packs.RelatedComponent;
      reader.readMessage(value,proto.packs.RelatedComponent.deserializeBinaryFromReader);
      msg.addComponents(value);
      break;
    case 7:
      var value = /** @type {string} */ (reader.readString());
      msg.addKeywords(value);
      break;
    case 8:
      var value = new proto.packs.ExampleEnvironment;
      reader.readMessage(value,proto.packs.ExampleEnvironment.deserializeBinaryFromReader);
      msg.addEnvironments(value);
      break;
    case 9:
      var value = new proto.packs.AssetReference;
      reader.readMessage(value,proto.packs.AssetReference.deserializeBinaryFromReader);
      msg.setDocumentation(value);
      break;
    case 10:
      var value = new proto.packs.PackId;
      reader.readMessage(value,proto.packs.PackId.deserializeBinaryFromReader);
      msg.setPack(value);
      break;
    case 11:
      var value = new proto.packs.PackFileReference;
      reader.readMessage(value,proto.packs.PackFileReference.deserializeBinaryFromReader);
      msg.setFolder(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.Example.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.Example.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.Example} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.Example.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.packs.ExampleId.serializeBinaryToWriter
    );
  }
  f = message.getName();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getDescription();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getVersion();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getCategoriesList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      5,
      f
    );
  }
  f = message.getComponentsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      6,
      f,
      proto.packs.RelatedComponent.serializeBinaryToWriter
    );
  }
  f = message.getKeywordsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      7,
      f
    );
  }
  f = message.getEnvironmentsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      8,
      f,
      proto.packs.ExampleEnvironment.serializeBinaryToWriter
    );
  }
  f = message.getDocumentation();
  if (f != null) {
    writer.writeMessage(
      9,
      f,
      proto.packs.AssetReference.serializeBinaryToWriter
    );
  }
  f = message.getPack();
  if (f != null) {
    writer.writeMessage(
      10,
      f,
      proto.packs.PackId.serializeBinaryToWriter
    );
  }
  f = message.getFolder();
  if (f != null) {
    writer.writeMessage(
      11,
      f,
      proto.packs.PackFileReference.serializeBinaryToWriter
    );
  }
};


/**
 * optional ExampleId id = 1;
 * @return {?proto.packs.ExampleId}
 */
proto.packs.Example.prototype.getId = function() {
  return /** @type{?proto.packs.ExampleId} */ (
    jspb.Message.getWrapperField(this, proto.packs.ExampleId, 1));
};


/**
 * @param {?proto.packs.ExampleId|undefined} value
 * @return {!proto.packs.Example} returns this
*/
proto.packs.Example.prototype.setId = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.Example} returns this
 */
proto.packs.Example.prototype.clearId = function() {
  return this.setId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.Example.prototype.hasId = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional string name = 2;
 * @return {string}
 */
proto.packs.Example.prototype.getName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.Example} returns this
 */
proto.packs.Example.prototype.setName = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string description = 3;
 * @return {string}
 */
proto.packs.Example.prototype.getDescription = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.Example} returns this
 */
proto.packs.Example.prototype.setDescription = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string version = 4;
 * @return {string}
 */
proto.packs.Example.prototype.getVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.Example} returns this
 */
proto.packs.Example.prototype.setVersion = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * repeated string categories = 5;
 * @return {!Array<string>}
 */
proto.packs.Example.prototype.getCategoriesList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 5));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.packs.Example} returns this
 */
proto.packs.Example.prototype.setCategoriesList = function(value) {
  return jspb.Message.setField(this, 5, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.packs.Example} returns this
 */
proto.packs.Example.prototype.addCategories = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 5, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.Example} returns this
 */
proto.packs.Example.prototype.clearCategoriesList = function() {
  return this.setCategoriesList([]);
};


/**
 * repeated RelatedComponent components = 6;
 * @return {!Array<!proto.packs.RelatedComponent>}
 */
proto.packs.Example.prototype.getComponentsList = function() {
  return /** @type{!Array<!proto.packs.RelatedComponent>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.packs.RelatedComponent, 6));
};


/**
 * @param {!Array<!proto.packs.RelatedComponent>} value
 * @return {!proto.packs.Example} returns this
*/
proto.packs.Example.prototype.setComponentsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 6, value);
};


/**
 * @param {!proto.packs.RelatedComponent=} opt_value
 * @param {number=} opt_index
 * @return {!proto.packs.RelatedComponent}
 */
proto.packs.Example.prototype.addComponents = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 6, opt_value, proto.packs.RelatedComponent, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.Example} returns this
 */
proto.packs.Example.prototype.clearComponentsList = function() {
  return this.setComponentsList([]);
};


/**
 * repeated string keywords = 7;
 * @return {!Array<string>}
 */
proto.packs.Example.prototype.getKeywordsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 7));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.packs.Example} returns this
 */
proto.packs.Example.prototype.setKeywordsList = function(value) {
  return jspb.Message.setField(this, 7, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.packs.Example} returns this
 */
proto.packs.Example.prototype.addKeywords = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 7, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.Example} returns this
 */
proto.packs.Example.prototype.clearKeywordsList = function() {
  return this.setKeywordsList([]);
};


/**
 * repeated ExampleEnvironment environments = 8;
 * @return {!Array<!proto.packs.ExampleEnvironment>}
 */
proto.packs.Example.prototype.getEnvironmentsList = function() {
  return /** @type{!Array<!proto.packs.ExampleEnvironment>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.packs.ExampleEnvironment, 8));
};


/**
 * @param {!Array<!proto.packs.ExampleEnvironment>} value
 * @return {!proto.packs.Example} returns this
*/
proto.packs.Example.prototype.setEnvironmentsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 8, value);
};


/**
 * @param {!proto.packs.ExampleEnvironment=} opt_value
 * @param {number=} opt_index
 * @return {!proto.packs.ExampleEnvironment}
 */
proto.packs.Example.prototype.addEnvironments = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 8, opt_value, proto.packs.ExampleEnvironment, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.Example} returns this
 */
proto.packs.Example.prototype.clearEnvironmentsList = function() {
  return this.setEnvironmentsList([]);
};


/**
 * optional AssetReference documentation = 9;
 * @return {?proto.packs.AssetReference}
 */
proto.packs.Example.prototype.getDocumentation = function() {
  return /** @type{?proto.packs.AssetReference} */ (
    jspb.Message.getWrapperField(this, proto.packs.AssetReference, 9));
};


/**
 * @param {?proto.packs.AssetReference|undefined} value
 * @return {!proto.packs.Example} returns this
*/
proto.packs.Example.prototype.setDocumentation = function(value) {
  return jspb.Message.setWrapperField(this, 9, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.Example} returns this
 */
proto.packs.Example.prototype.clearDocumentation = function() {
  return this.setDocumentation(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.Example.prototype.hasDocumentation = function() {
  return jspb.Message.getField(this, 9) != null;
};


/**
 * optional PackId pack = 10;
 * @return {?proto.packs.PackId}
 */
proto.packs.Example.prototype.getPack = function() {
  return /** @type{?proto.packs.PackId} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackId, 10));
};


/**
 * @param {?proto.packs.PackId|undefined} value
 * @return {!proto.packs.Example} returns this
*/
proto.packs.Example.prototype.setPack = function(value) {
  return jspb.Message.setWrapperField(this, 10, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.Example} returns this
 */
proto.packs.Example.prototype.clearPack = function() {
  return this.setPack(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.Example.prototype.hasPack = function() {
  return jspb.Message.getField(this, 10) != null;
};


/**
 * optional PackFileReference folder = 11;
 * @return {?proto.packs.PackFileReference}
 */
proto.packs.Example.prototype.getFolder = function() {
  return /** @type{?proto.packs.PackFileReference} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackFileReference, 11));
};


/**
 * @param {?proto.packs.PackFileReference|undefined} value
 * @return {!proto.packs.Example} returns this
*/
proto.packs.Example.prototype.setFolder = function(value) {
  return jspb.Message.setWrapperField(this, 11, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.Example} returns this
 */
proto.packs.Example.prototype.clearFolder = function() {
  return this.setFolder(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.Example.prototype.hasFolder = function() {
  return jspb.Message.getField(this, 11) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.RefAppId.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.RefAppId.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.RefAppId} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.RefAppId.toObject = function(includeInstance, msg) {
  var f, obj = {
    packId: (f = msg.getPackId()) && proto.packs.PackId.toObject(includeInstance, f),
    name: jspb.Message.getFieldWithDefault(msg, 2, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.RefAppId}
 */
proto.packs.RefAppId.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.RefAppId;
  return proto.packs.RefAppId.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.RefAppId} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.RefAppId}
 */
proto.packs.RefAppId.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.PackId;
      reader.readMessage(value,proto.packs.PackId.deserializeBinaryFromReader);
      msg.setPackId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setName(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.RefAppId.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.RefAppId.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.RefAppId} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.RefAppId.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPackId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.packs.PackId.serializeBinaryToWriter
    );
  }
  f = message.getName();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
};


/**
 * optional PackId pack_id = 1;
 * @return {?proto.packs.PackId}
 */
proto.packs.RefAppId.prototype.getPackId = function() {
  return /** @type{?proto.packs.PackId} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackId, 1));
};


/**
 * @param {?proto.packs.PackId|undefined} value
 * @return {!proto.packs.RefAppId} returns this
*/
proto.packs.RefAppId.prototype.setPackId = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.RefAppId} returns this
 */
proto.packs.RefAppId.prototype.clearPackId = function() {
  return this.setPackId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.RefAppId.prototype.hasPackId = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional string name = 2;
 * @return {string}
 */
proto.packs.RefAppId.prototype.getName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.RefAppId} returns this
 */
proto.packs.RefAppId.prototype.setName = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.packs.RefApp.repeatedFields_ = [5,6,7,8];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.RefApp.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.RefApp.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.RefApp} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.RefApp.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: (f = msg.getId()) && proto.packs.RefAppId.toObject(includeInstance, f),
    name: jspb.Message.getFieldWithDefault(msg, 2, ""),
    description: jspb.Message.getFieldWithDefault(msg, 3, ""),
    version: jspb.Message.getFieldWithDefault(msg, 4, ""),
    categoriesList: (f = jspb.Message.getRepeatedField(msg, 5)) == null ? undefined : f,
    componentsList: jspb.Message.toObjectList(msg.getComponentsList(),
    proto.packs.RelatedComponent.toObject, includeInstance),
    keywordsList: (f = jspb.Message.getRepeatedField(msg, 7)) == null ? undefined : f,
    environmentsList: jspb.Message.toObjectList(msg.getEnvironmentsList(),
    proto.packs.ExampleEnvironment.toObject, includeInstance),
    documentation: (f = msg.getDocumentation()) && proto.packs.AssetReference.toObject(includeInstance, f),
    pack: (f = msg.getPack()) && proto.packs.PackId.toObject(includeInstance, f),
    folder: (f = msg.getFolder()) && proto.packs.PackFileReference.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.RefApp}
 */
proto.packs.RefApp.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.RefApp;
  return proto.packs.RefApp.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.RefApp} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.RefApp}
 */
proto.packs.RefApp.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.RefAppId;
      reader.readMessage(value,proto.packs.RefAppId.deserializeBinaryFromReader);
      msg.setId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setName(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setDescription(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setVersion(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.addCategories(value);
      break;
    case 6:
      var value = new proto.packs.RelatedComponent;
      reader.readMessage(value,proto.packs.RelatedComponent.deserializeBinaryFromReader);
      msg.addComponents(value);
      break;
    case 7:
      var value = /** @type {string} */ (reader.readString());
      msg.addKeywords(value);
      break;
    case 8:
      var value = new proto.packs.ExampleEnvironment;
      reader.readMessage(value,proto.packs.ExampleEnvironment.deserializeBinaryFromReader);
      msg.addEnvironments(value);
      break;
    case 9:
      var value = new proto.packs.AssetReference;
      reader.readMessage(value,proto.packs.AssetReference.deserializeBinaryFromReader);
      msg.setDocumentation(value);
      break;
    case 10:
      var value = new proto.packs.PackId;
      reader.readMessage(value,proto.packs.PackId.deserializeBinaryFromReader);
      msg.setPack(value);
      break;
    case 11:
      var value = new proto.packs.PackFileReference;
      reader.readMessage(value,proto.packs.PackFileReference.deserializeBinaryFromReader);
      msg.setFolder(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.RefApp.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.RefApp.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.RefApp} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.RefApp.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.packs.RefAppId.serializeBinaryToWriter
    );
  }
  f = message.getName();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getDescription();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getVersion();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getCategoriesList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      5,
      f
    );
  }
  f = message.getComponentsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      6,
      f,
      proto.packs.RelatedComponent.serializeBinaryToWriter
    );
  }
  f = message.getKeywordsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      7,
      f
    );
  }
  f = message.getEnvironmentsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      8,
      f,
      proto.packs.ExampleEnvironment.serializeBinaryToWriter
    );
  }
  f = message.getDocumentation();
  if (f != null) {
    writer.writeMessage(
      9,
      f,
      proto.packs.AssetReference.serializeBinaryToWriter
    );
  }
  f = message.getPack();
  if (f != null) {
    writer.writeMessage(
      10,
      f,
      proto.packs.PackId.serializeBinaryToWriter
    );
  }
  f = message.getFolder();
  if (f != null) {
    writer.writeMessage(
      11,
      f,
      proto.packs.PackFileReference.serializeBinaryToWriter
    );
  }
};


/**
 * optional RefAppId id = 1;
 * @return {?proto.packs.RefAppId}
 */
proto.packs.RefApp.prototype.getId = function() {
  return /** @type{?proto.packs.RefAppId} */ (
    jspb.Message.getWrapperField(this, proto.packs.RefAppId, 1));
};


/**
 * @param {?proto.packs.RefAppId|undefined} value
 * @return {!proto.packs.RefApp} returns this
*/
proto.packs.RefApp.prototype.setId = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.RefApp} returns this
 */
proto.packs.RefApp.prototype.clearId = function() {
  return this.setId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.RefApp.prototype.hasId = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional string name = 2;
 * @return {string}
 */
proto.packs.RefApp.prototype.getName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.RefApp} returns this
 */
proto.packs.RefApp.prototype.setName = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string description = 3;
 * @return {string}
 */
proto.packs.RefApp.prototype.getDescription = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.RefApp} returns this
 */
proto.packs.RefApp.prototype.setDescription = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string version = 4;
 * @return {string}
 */
proto.packs.RefApp.prototype.getVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.RefApp} returns this
 */
proto.packs.RefApp.prototype.setVersion = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * repeated string categories = 5;
 * @return {!Array<string>}
 */
proto.packs.RefApp.prototype.getCategoriesList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 5));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.packs.RefApp} returns this
 */
proto.packs.RefApp.prototype.setCategoriesList = function(value) {
  return jspb.Message.setField(this, 5, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.packs.RefApp} returns this
 */
proto.packs.RefApp.prototype.addCategories = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 5, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.RefApp} returns this
 */
proto.packs.RefApp.prototype.clearCategoriesList = function() {
  return this.setCategoriesList([]);
};


/**
 * repeated RelatedComponent components = 6;
 * @return {!Array<!proto.packs.RelatedComponent>}
 */
proto.packs.RefApp.prototype.getComponentsList = function() {
  return /** @type{!Array<!proto.packs.RelatedComponent>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.packs.RelatedComponent, 6));
};


/**
 * @param {!Array<!proto.packs.RelatedComponent>} value
 * @return {!proto.packs.RefApp} returns this
*/
proto.packs.RefApp.prototype.setComponentsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 6, value);
};


/**
 * @param {!proto.packs.RelatedComponent=} opt_value
 * @param {number=} opt_index
 * @return {!proto.packs.RelatedComponent}
 */
proto.packs.RefApp.prototype.addComponents = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 6, opt_value, proto.packs.RelatedComponent, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.RefApp} returns this
 */
proto.packs.RefApp.prototype.clearComponentsList = function() {
  return this.setComponentsList([]);
};


/**
 * repeated string keywords = 7;
 * @return {!Array<string>}
 */
proto.packs.RefApp.prototype.getKeywordsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 7));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.packs.RefApp} returns this
 */
proto.packs.RefApp.prototype.setKeywordsList = function(value) {
  return jspb.Message.setField(this, 7, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.packs.RefApp} returns this
 */
proto.packs.RefApp.prototype.addKeywords = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 7, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.RefApp} returns this
 */
proto.packs.RefApp.prototype.clearKeywordsList = function() {
  return this.setKeywordsList([]);
};


/**
 * repeated ExampleEnvironment environments = 8;
 * @return {!Array<!proto.packs.ExampleEnvironment>}
 */
proto.packs.RefApp.prototype.getEnvironmentsList = function() {
  return /** @type{!Array<!proto.packs.ExampleEnvironment>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.packs.ExampleEnvironment, 8));
};


/**
 * @param {!Array<!proto.packs.ExampleEnvironment>} value
 * @return {!proto.packs.RefApp} returns this
*/
proto.packs.RefApp.prototype.setEnvironmentsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 8, value);
};


/**
 * @param {!proto.packs.ExampleEnvironment=} opt_value
 * @param {number=} opt_index
 * @return {!proto.packs.ExampleEnvironment}
 */
proto.packs.RefApp.prototype.addEnvironments = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 8, opt_value, proto.packs.ExampleEnvironment, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.packs.RefApp} returns this
 */
proto.packs.RefApp.prototype.clearEnvironmentsList = function() {
  return this.setEnvironmentsList([]);
};


/**
 * optional AssetReference documentation = 9;
 * @return {?proto.packs.AssetReference}
 */
proto.packs.RefApp.prototype.getDocumentation = function() {
  return /** @type{?proto.packs.AssetReference} */ (
    jspb.Message.getWrapperField(this, proto.packs.AssetReference, 9));
};


/**
 * @param {?proto.packs.AssetReference|undefined} value
 * @return {!proto.packs.RefApp} returns this
*/
proto.packs.RefApp.prototype.setDocumentation = function(value) {
  return jspb.Message.setWrapperField(this, 9, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.RefApp} returns this
 */
proto.packs.RefApp.prototype.clearDocumentation = function() {
  return this.setDocumentation(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.RefApp.prototype.hasDocumentation = function() {
  return jspb.Message.getField(this, 9) != null;
};


/**
 * optional PackId pack = 10;
 * @return {?proto.packs.PackId}
 */
proto.packs.RefApp.prototype.getPack = function() {
  return /** @type{?proto.packs.PackId} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackId, 10));
};


/**
 * @param {?proto.packs.PackId|undefined} value
 * @return {!proto.packs.RefApp} returns this
*/
proto.packs.RefApp.prototype.setPack = function(value) {
  return jspb.Message.setWrapperField(this, 10, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.RefApp} returns this
 */
proto.packs.RefApp.prototype.clearPack = function() {
  return this.setPack(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.RefApp.prototype.hasPack = function() {
  return jspb.Message.getField(this, 10) != null;
};


/**
 * optional PackFileReference folder = 11;
 * @return {?proto.packs.PackFileReference}
 */
proto.packs.RefApp.prototype.getFolder = function() {
  return /** @type{?proto.packs.PackFileReference} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackFileReference, 11));
};


/**
 * @param {?proto.packs.PackFileReference|undefined} value
 * @return {!proto.packs.RefApp} returns this
*/
proto.packs.RefApp.prototype.setFolder = function(value) {
  return jspb.Message.setWrapperField(this, 11, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.RefApp} returns this
 */
proto.packs.RefApp.prototype.clearFolder = function() {
  return this.setFolder(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.RefApp.prototype.hasFolder = function() {
  return jspb.Message.getField(this, 11) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.TemplateId.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.TemplateId.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.TemplateId} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.TemplateId.toObject = function(includeInstance, msg) {
  var f, obj = {
    packId: (f = msg.getPackId()) && proto.packs.PackId.toObject(includeInstance, f),
    name: jspb.Message.getFieldWithDefault(msg, 2, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.TemplateId}
 */
proto.packs.TemplateId.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.TemplateId;
  return proto.packs.TemplateId.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.TemplateId} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.TemplateId}
 */
proto.packs.TemplateId.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.PackId;
      reader.readMessage(value,proto.packs.PackId.deserializeBinaryFromReader);
      msg.setPackId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setName(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.TemplateId.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.TemplateId.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.TemplateId} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.TemplateId.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPackId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.packs.PackId.serializeBinaryToWriter
    );
  }
  f = message.getName();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
};


/**
 * optional PackId pack_id = 1;
 * @return {?proto.packs.PackId}
 */
proto.packs.TemplateId.prototype.getPackId = function() {
  return /** @type{?proto.packs.PackId} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackId, 1));
};


/**
 * @param {?proto.packs.PackId|undefined} value
 * @return {!proto.packs.TemplateId} returns this
*/
proto.packs.TemplateId.prototype.setPackId = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.TemplateId} returns this
 */
proto.packs.TemplateId.prototype.clearPackId = function() {
  return this.setPackId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.TemplateId.prototype.hasPackId = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional string name = 2;
 * @return {string}
 */
proto.packs.TemplateId.prototype.getName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.TemplateId} returns this
 */
proto.packs.TemplateId.prototype.setName = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.Template.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.Template.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.Template} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.Template.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: (f = msg.getId()) && proto.packs.TemplateId.toObject(includeInstance, f),
    name: jspb.Message.getFieldWithDefault(msg, 2, ""),
    folder: (f = msg.getFolder()) && proto.packs.PackFileReference.toObject(includeInstance, f),
    projectFile: jspb.Message.getFieldWithDefault(msg, 4, ""),
    copyTo: jspb.Message.getFieldWithDefault(msg, 5, ""),
    description: jspb.Message.getFieldWithDefault(msg, 6, ""),
    pack: (f = msg.getPack()) && proto.packs.PackId.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.Template}
 */
proto.packs.Template.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.Template;
  return proto.packs.Template.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.Template} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.Template}
 */
proto.packs.Template.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.TemplateId;
      reader.readMessage(value,proto.packs.TemplateId.deserializeBinaryFromReader);
      msg.setId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setName(value);
      break;
    case 3:
      var value = new proto.packs.PackFileReference;
      reader.readMessage(value,proto.packs.PackFileReference.deserializeBinaryFromReader);
      msg.setFolder(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setProjectFile(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setCopyTo(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readString());
      msg.setDescription(value);
      break;
    case 7:
      var value = new proto.packs.PackId;
      reader.readMessage(value,proto.packs.PackId.deserializeBinaryFromReader);
      msg.setPack(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.Template.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.Template.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.Template} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.Template.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.packs.TemplateId.serializeBinaryToWriter
    );
  }
  f = message.getName();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getFolder();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.packs.PackFileReference.serializeBinaryToWriter
    );
  }
  f = message.getProjectFile();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 5));
  if (f != null) {
    writer.writeString(
      5,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 6));
  if (f != null) {
    writer.writeString(
      6,
      f
    );
  }
  f = message.getPack();
  if (f != null) {
    writer.writeMessage(
      7,
      f,
      proto.packs.PackId.serializeBinaryToWriter
    );
  }
};


/**
 * optional TemplateId id = 1;
 * @return {?proto.packs.TemplateId}
 */
proto.packs.Template.prototype.getId = function() {
  return /** @type{?proto.packs.TemplateId} */ (
    jspb.Message.getWrapperField(this, proto.packs.TemplateId, 1));
};


/**
 * @param {?proto.packs.TemplateId|undefined} value
 * @return {!proto.packs.Template} returns this
*/
proto.packs.Template.prototype.setId = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.Template} returns this
 */
proto.packs.Template.prototype.clearId = function() {
  return this.setId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.Template.prototype.hasId = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional string name = 2;
 * @return {string}
 */
proto.packs.Template.prototype.getName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.Template} returns this
 */
proto.packs.Template.prototype.setName = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional PackFileReference folder = 3;
 * @return {?proto.packs.PackFileReference}
 */
proto.packs.Template.prototype.getFolder = function() {
  return /** @type{?proto.packs.PackFileReference} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackFileReference, 3));
};


/**
 * @param {?proto.packs.PackFileReference|undefined} value
 * @return {!proto.packs.Template} returns this
*/
proto.packs.Template.prototype.setFolder = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.Template} returns this
 */
proto.packs.Template.prototype.clearFolder = function() {
  return this.setFolder(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.Template.prototype.hasFolder = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional string project_file = 4;
 * @return {string}
 */
proto.packs.Template.prototype.getProjectFile = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.Template} returns this
 */
proto.packs.Template.prototype.setProjectFile = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional string copy_to = 5;
 * @return {string}
 */
proto.packs.Template.prototype.getCopyTo = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.Template} returns this
 */
proto.packs.Template.prototype.setCopyTo = function(value) {
  return jspb.Message.setField(this, 5, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.packs.Template} returns this
 */
proto.packs.Template.prototype.clearCopyTo = function() {
  return jspb.Message.setField(this, 5, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.Template.prototype.hasCopyTo = function() {
  return jspb.Message.getField(this, 5) != null;
};


/**
 * optional string description = 6;
 * @return {string}
 */
proto.packs.Template.prototype.getDescription = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.Template} returns this
 */
proto.packs.Template.prototype.setDescription = function(value) {
  return jspb.Message.setField(this, 6, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.packs.Template} returns this
 */
proto.packs.Template.prototype.clearDescription = function() {
  return jspb.Message.setField(this, 6, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.Template.prototype.hasDescription = function() {
  return jspb.Message.getField(this, 6) != null;
};


/**
 * optional PackId pack = 7;
 * @return {?proto.packs.PackId}
 */
proto.packs.Template.prototype.getPack = function() {
  return /** @type{?proto.packs.PackId} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackId, 7));
};


/**
 * @param {?proto.packs.PackId|undefined} value
 * @return {!proto.packs.Template} returns this
*/
proto.packs.Template.prototype.setPack = function(value) {
  return jspb.Message.setWrapperField(this, 7, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.Template} returns this
 */
proto.packs.Template.prototype.clearPack = function() {
  return this.setPack(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.Template.prototype.hasPack = function() {
  return jspb.Message.getField(this, 7) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.RelatedComponent.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.RelatedComponent.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.RelatedComponent} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.RelatedComponent.toObject = function(includeInstance, msg) {
  var f, obj = {
    className: jspb.Message.getFieldWithDefault(msg, 1, ""),
    group: jspb.Message.getFieldWithDefault(msg, 2, ""),
    subgroup: jspb.Message.getFieldWithDefault(msg, 3, ""),
    version: jspb.Message.getFieldWithDefault(msg, 4, ""),
    vendor: jspb.Message.getFieldWithDefault(msg, 5, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.RelatedComponent}
 */
proto.packs.RelatedComponent.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.RelatedComponent;
  return proto.packs.RelatedComponent.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.RelatedComponent} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.RelatedComponent}
 */
proto.packs.RelatedComponent.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setClassName(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setGroup(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setSubgroup(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setVersion(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setVendor(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.RelatedComponent.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.RelatedComponent.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.RelatedComponent} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.RelatedComponent.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getClassName();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getGroup();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getSubgroup();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getVersion();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getVendor();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
};


/**
 * optional string class_name = 1;
 * @return {string}
 */
proto.packs.RelatedComponent.prototype.getClassName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.RelatedComponent} returns this
 */
proto.packs.RelatedComponent.prototype.setClassName = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string group = 2;
 * @return {string}
 */
proto.packs.RelatedComponent.prototype.getGroup = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.RelatedComponent} returns this
 */
proto.packs.RelatedComponent.prototype.setGroup = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string subgroup = 3;
 * @return {string}
 */
proto.packs.RelatedComponent.prototype.getSubgroup = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.RelatedComponent} returns this
 */
proto.packs.RelatedComponent.prototype.setSubgroup = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string version = 4;
 * @return {string}
 */
proto.packs.RelatedComponent.prototype.getVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.RelatedComponent} returns this
 */
proto.packs.RelatedComponent.prototype.setVersion = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional string vendor = 5;
 * @return {string}
 */
proto.packs.RelatedComponent.prototype.getVendor = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.RelatedComponent} returns this
 */
proto.packs.RelatedComponent.prototype.setVendor = function(value) {
  return jspb.Message.setProto3StringField(this, 5, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.ExampleEnvironment.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.ExampleEnvironment.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.ExampleEnvironment} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ExampleEnvironment.toObject = function(includeInstance, msg) {
  var f, obj = {
    toolchain: jspb.Message.getFieldWithDefault(msg, 1, ""),
    projectFile: (f = msg.getProjectFile()) && proto.packs.PackFileReference.toObject(includeInstance, f),
    folder: (f = msg.getFolder()) && proto.packs.PackFileReference.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.ExampleEnvironment}
 */
proto.packs.ExampleEnvironment.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.ExampleEnvironment;
  return proto.packs.ExampleEnvironment.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.ExampleEnvironment} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.ExampleEnvironment}
 */
proto.packs.ExampleEnvironment.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setToolchain(value);
      break;
    case 2:
      var value = new proto.packs.PackFileReference;
      reader.readMessage(value,proto.packs.PackFileReference.deserializeBinaryFromReader);
      msg.setProjectFile(value);
      break;
    case 3:
      var value = new proto.packs.PackFileReference;
      reader.readMessage(value,proto.packs.PackFileReference.deserializeBinaryFromReader);
      msg.setFolder(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.ExampleEnvironment.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.ExampleEnvironment.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.ExampleEnvironment} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ExampleEnvironment.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getToolchain();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getProjectFile();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.packs.PackFileReference.serializeBinaryToWriter
    );
  }
  f = message.getFolder();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.packs.PackFileReference.serializeBinaryToWriter
    );
  }
};


/**
 * optional string toolchain = 1;
 * @return {string}
 */
proto.packs.ExampleEnvironment.prototype.getToolchain = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.ExampleEnvironment} returns this
 */
proto.packs.ExampleEnvironment.prototype.setToolchain = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional PackFileReference project_file = 2;
 * @return {?proto.packs.PackFileReference}
 */
proto.packs.ExampleEnvironment.prototype.getProjectFile = function() {
  return /** @type{?proto.packs.PackFileReference} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackFileReference, 2));
};


/**
 * @param {?proto.packs.PackFileReference|undefined} value
 * @return {!proto.packs.ExampleEnvironment} returns this
*/
proto.packs.ExampleEnvironment.prototype.setProjectFile = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.ExampleEnvironment} returns this
 */
proto.packs.ExampleEnvironment.prototype.clearProjectFile = function() {
  return this.setProjectFile(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ExampleEnvironment.prototype.hasProjectFile = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional PackFileReference folder = 3;
 * @return {?proto.packs.PackFileReference}
 */
proto.packs.ExampleEnvironment.prototype.getFolder = function() {
  return /** @type{?proto.packs.PackFileReference} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackFileReference, 3));
};


/**
 * @param {?proto.packs.PackFileReference|undefined} value
 * @return {!proto.packs.ExampleEnvironment} returns this
*/
proto.packs.ExampleEnvironment.prototype.setFolder = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.ExampleEnvironment} returns this
 */
proto.packs.ExampleEnvironment.prototype.clearFolder = function() {
  return this.setFolder(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ExampleEnvironment.prototype.hasFolder = function() {
  return jspb.Message.getField(this, 3) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.ComponentFilter.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.ComponentFilter.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.ComponentFilter} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ComponentFilter.toObject = function(includeInstance, msg) {
  var f, obj = {
    bundleName: jspb.Message.getFieldWithDefault(msg, 1, ""),
    className: jspb.Message.getFieldWithDefault(msg, 2, ""),
    group: jspb.Message.getFieldWithDefault(msg, 3, ""),
    subgroup: jspb.Message.getFieldWithDefault(msg, 4, ""),
    vendor: jspb.Message.getFieldWithDefault(msg, 5, ""),
    version: jspb.Message.getFieldWithDefault(msg, 6, ""),
    variant: jspb.Message.getFieldWithDefault(msg, 7, ""),
    apiVersion: jspb.Message.getFieldWithDefault(msg, 8, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.ComponentFilter}
 */
proto.packs.ComponentFilter.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.ComponentFilter;
  return proto.packs.ComponentFilter.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.ComponentFilter} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.ComponentFilter}
 */
proto.packs.ComponentFilter.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setBundleName(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setClassName(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setGroup(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setSubgroup(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setVendor(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readString());
      msg.setVersion(value);
      break;
    case 7:
      var value = /** @type {string} */ (reader.readString());
      msg.setVariant(value);
      break;
    case 8:
      var value = /** @type {string} */ (reader.readString());
      msg.setApiVersion(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.ComponentFilter.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.ComponentFilter.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.ComponentFilter} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ComponentFilter.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = /** @type {string} */ (jspb.Message.getField(message, 1));
  if (f != null) {
    writer.writeString(
      1,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 2));
  if (f != null) {
    writer.writeString(
      2,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 3));
  if (f != null) {
    writer.writeString(
      3,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 4));
  if (f != null) {
    writer.writeString(
      4,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 5));
  if (f != null) {
    writer.writeString(
      5,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 6));
  if (f != null) {
    writer.writeString(
      6,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 7));
  if (f != null) {
    writer.writeString(
      7,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 8));
  if (f != null) {
    writer.writeString(
      8,
      f
    );
  }
};


/**
 * optional string bundle_name = 1;
 * @return {string}
 */
proto.packs.ComponentFilter.prototype.getBundleName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.ComponentFilter} returns this
 */
proto.packs.ComponentFilter.prototype.setBundleName = function(value) {
  return jspb.Message.setField(this, 1, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.packs.ComponentFilter} returns this
 */
proto.packs.ComponentFilter.prototype.clearBundleName = function() {
  return jspb.Message.setField(this, 1, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ComponentFilter.prototype.hasBundleName = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional string class_name = 2;
 * @return {string}
 */
proto.packs.ComponentFilter.prototype.getClassName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.ComponentFilter} returns this
 */
proto.packs.ComponentFilter.prototype.setClassName = function(value) {
  return jspb.Message.setField(this, 2, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.packs.ComponentFilter} returns this
 */
proto.packs.ComponentFilter.prototype.clearClassName = function() {
  return jspb.Message.setField(this, 2, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ComponentFilter.prototype.hasClassName = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional string group = 3;
 * @return {string}
 */
proto.packs.ComponentFilter.prototype.getGroup = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.ComponentFilter} returns this
 */
proto.packs.ComponentFilter.prototype.setGroup = function(value) {
  return jspb.Message.setField(this, 3, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.packs.ComponentFilter} returns this
 */
proto.packs.ComponentFilter.prototype.clearGroup = function() {
  return jspb.Message.setField(this, 3, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ComponentFilter.prototype.hasGroup = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional string subgroup = 4;
 * @return {string}
 */
proto.packs.ComponentFilter.prototype.getSubgroup = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.ComponentFilter} returns this
 */
proto.packs.ComponentFilter.prototype.setSubgroup = function(value) {
  return jspb.Message.setField(this, 4, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.packs.ComponentFilter} returns this
 */
proto.packs.ComponentFilter.prototype.clearSubgroup = function() {
  return jspb.Message.setField(this, 4, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ComponentFilter.prototype.hasSubgroup = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional string vendor = 5;
 * @return {string}
 */
proto.packs.ComponentFilter.prototype.getVendor = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.ComponentFilter} returns this
 */
proto.packs.ComponentFilter.prototype.setVendor = function(value) {
  return jspb.Message.setField(this, 5, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.packs.ComponentFilter} returns this
 */
proto.packs.ComponentFilter.prototype.clearVendor = function() {
  return jspb.Message.setField(this, 5, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ComponentFilter.prototype.hasVendor = function() {
  return jspb.Message.getField(this, 5) != null;
};


/**
 * optional string version = 6;
 * @return {string}
 */
proto.packs.ComponentFilter.prototype.getVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.ComponentFilter} returns this
 */
proto.packs.ComponentFilter.prototype.setVersion = function(value) {
  return jspb.Message.setField(this, 6, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.packs.ComponentFilter} returns this
 */
proto.packs.ComponentFilter.prototype.clearVersion = function() {
  return jspb.Message.setField(this, 6, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ComponentFilter.prototype.hasVersion = function() {
  return jspb.Message.getField(this, 6) != null;
};


/**
 * optional string variant = 7;
 * @return {string}
 */
proto.packs.ComponentFilter.prototype.getVariant = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 7, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.ComponentFilter} returns this
 */
proto.packs.ComponentFilter.prototype.setVariant = function(value) {
  return jspb.Message.setField(this, 7, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.packs.ComponentFilter} returns this
 */
proto.packs.ComponentFilter.prototype.clearVariant = function() {
  return jspb.Message.setField(this, 7, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ComponentFilter.prototype.hasVariant = function() {
  return jspb.Message.getField(this, 7) != null;
};


/**
 * optional string api_version = 8;
 * @return {string}
 */
proto.packs.ComponentFilter.prototype.getApiVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 8, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.ComponentFilter} returns this
 */
proto.packs.ComponentFilter.prototype.setApiVersion = function(value) {
  return jspb.Message.setField(this, 8, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.packs.ComponentFilter} returns this
 */
proto.packs.ComponentFilter.prototype.clearApiVersion = function() {
  return jspb.Message.setField(this, 8, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ComponentFilter.prototype.hasApiVersion = function() {
  return jspb.Message.getField(this, 8) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.TargetOptions.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.TargetOptions.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.TargetOptions} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.TargetOptions.toObject = function(includeInstance, msg) {
  var f, obj = {
    name: jspb.Message.getFieldWithDefault(msg, 1, ""),
    vendor: jspb.Message.getFieldWithDefault(msg, 2, ""),
    processorName: jspb.Message.getFieldWithDefault(msg, 3, ""),
    fpu: jspb.Message.getFieldWithDefault(msg, 4, 0),
    mpu: jspb.Message.getFieldWithDefault(msg, 5, 0),
    endian: jspb.Message.getFieldWithDefault(msg, 6, 0),
    tz: jspb.Message.getFieldWithDefault(msg, 7, 0),
    secure: jspb.Message.getFieldWithDefault(msg, 8, 0),
    dsp: jspb.Message.getFieldWithDefault(msg, 9, 0),
    mve: jspb.Message.getFieldWithDefault(msg, 10, 0),
    cdecp: jspb.Message.getFieldWithDefault(msg, 11, ""),
    pacbti: jspb.Message.getFieldWithDefault(msg, 12, 0),
    boardvendor: jspb.Message.getFieldWithDefault(msg, 13, ""),
    boardname: jspb.Message.getFieldWithDefault(msg, 14, ""),
    boardrevision: jspb.Message.getFieldWithDefault(msg, 15, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.TargetOptions}
 */
proto.packs.TargetOptions.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.TargetOptions;
  return proto.packs.TargetOptions.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.TargetOptions} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.TargetOptions}
 */
proto.packs.TargetOptions.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setName(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setVendor(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setProcessorName(value);
      break;
    case 4:
      var value = /** @type {!proto.packs.Fpu} */ (reader.readEnum());
      msg.setFpu(value);
      break;
    case 5:
      var value = /** @type {!proto.packs.Mpu} */ (reader.readEnum());
      msg.setMpu(value);
      break;
    case 6:
      var value = /** @type {!proto.packs.Endian} */ (reader.readEnum());
      msg.setEndian(value);
      break;
    case 7:
      var value = /** @type {!proto.packs.Tz} */ (reader.readEnum());
      msg.setTz(value);
      break;
    case 8:
      var value = /** @type {!proto.packs.Secure} */ (reader.readEnum());
      msg.setSecure(value);
      break;
    case 9:
      var value = /** @type {!proto.packs.Dsp} */ (reader.readEnum());
      msg.setDsp(value);
      break;
    case 10:
      var value = /** @type {!proto.packs.Mve} */ (reader.readEnum());
      msg.setMve(value);
      break;
    case 11:
      var value = /** @type {string} */ (reader.readString());
      msg.setCdecp(value);
      break;
    case 12:
      var value = /** @type {!proto.packs.Pacbti} */ (reader.readEnum());
      msg.setPacbti(value);
      break;
    case 13:
      var value = /** @type {string} */ (reader.readString());
      msg.setBoardvendor(value);
      break;
    case 14:
      var value = /** @type {string} */ (reader.readString());
      msg.setBoardname(value);
      break;
    case 15:
      var value = /** @type {string} */ (reader.readString());
      msg.setBoardrevision(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.TargetOptions.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.TargetOptions.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.TargetOptions} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.TargetOptions.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = /** @type {string} */ (jspb.Message.getField(message, 1));
  if (f != null) {
    writer.writeString(
      1,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 2));
  if (f != null) {
    writer.writeString(
      2,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 3));
  if (f != null) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getFpu();
  if (f !== 0.0) {
    writer.writeEnum(
      4,
      f
    );
  }
  f = message.getMpu();
  if (f !== 0.0) {
    writer.writeEnum(
      5,
      f
    );
  }
  f = message.getEndian();
  if (f !== 0.0) {
    writer.writeEnum(
      6,
      f
    );
  }
  f = message.getTz();
  if (f !== 0.0) {
    writer.writeEnum(
      7,
      f
    );
  }
  f = message.getSecure();
  if (f !== 0.0) {
    writer.writeEnum(
      8,
      f
    );
  }
  f = message.getDsp();
  if (f !== 0.0) {
    writer.writeEnum(
      9,
      f
    );
  }
  f = message.getMve();
  if (f !== 0.0) {
    writer.writeEnum(
      10,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 11));
  if (f != null) {
    writer.writeString(
      11,
      f
    );
  }
  f = message.getPacbti();
  if (f !== 0.0) {
    writer.writeEnum(
      12,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 13));
  if (f != null) {
    writer.writeString(
      13,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 14));
  if (f != null) {
    writer.writeString(
      14,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 15));
  if (f != null) {
    writer.writeString(
      15,
      f
    );
  }
};


/**
 * optional string name = 1;
 * @return {string}
 */
proto.packs.TargetOptions.prototype.getName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.TargetOptions} returns this
 */
proto.packs.TargetOptions.prototype.setName = function(value) {
  return jspb.Message.setField(this, 1, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.packs.TargetOptions} returns this
 */
proto.packs.TargetOptions.prototype.clearName = function() {
  return jspb.Message.setField(this, 1, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.TargetOptions.prototype.hasName = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional string vendor = 2;
 * @return {string}
 */
proto.packs.TargetOptions.prototype.getVendor = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.TargetOptions} returns this
 */
proto.packs.TargetOptions.prototype.setVendor = function(value) {
  return jspb.Message.setField(this, 2, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.packs.TargetOptions} returns this
 */
proto.packs.TargetOptions.prototype.clearVendor = function() {
  return jspb.Message.setField(this, 2, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.TargetOptions.prototype.hasVendor = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional string processor_name = 3;
 * @return {string}
 */
proto.packs.TargetOptions.prototype.getProcessorName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.TargetOptions} returns this
 */
proto.packs.TargetOptions.prototype.setProcessorName = function(value) {
  return jspb.Message.setField(this, 3, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.packs.TargetOptions} returns this
 */
proto.packs.TargetOptions.prototype.clearProcessorName = function() {
  return jspb.Message.setField(this, 3, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.TargetOptions.prototype.hasProcessorName = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional Fpu fpu = 4;
 * @return {!proto.packs.Fpu}
 */
proto.packs.TargetOptions.prototype.getFpu = function() {
  return /** @type {!proto.packs.Fpu} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {!proto.packs.Fpu} value
 * @return {!proto.packs.TargetOptions} returns this
 */
proto.packs.TargetOptions.prototype.setFpu = function(value) {
  return jspb.Message.setProto3EnumField(this, 4, value);
};


/**
 * optional Mpu mpu = 5;
 * @return {!proto.packs.Mpu}
 */
proto.packs.TargetOptions.prototype.getMpu = function() {
  return /** @type {!proto.packs.Mpu} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {!proto.packs.Mpu} value
 * @return {!proto.packs.TargetOptions} returns this
 */
proto.packs.TargetOptions.prototype.setMpu = function(value) {
  return jspb.Message.setProto3EnumField(this, 5, value);
};


/**
 * optional Endian endian = 6;
 * @return {!proto.packs.Endian}
 */
proto.packs.TargetOptions.prototype.getEndian = function() {
  return /** @type {!proto.packs.Endian} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/**
 * @param {!proto.packs.Endian} value
 * @return {!proto.packs.TargetOptions} returns this
 */
proto.packs.TargetOptions.prototype.setEndian = function(value) {
  return jspb.Message.setProto3EnumField(this, 6, value);
};


/**
 * optional Tz tz = 7;
 * @return {!proto.packs.Tz}
 */
proto.packs.TargetOptions.prototype.getTz = function() {
  return /** @type {!proto.packs.Tz} */ (jspb.Message.getFieldWithDefault(this, 7, 0));
};


/**
 * @param {!proto.packs.Tz} value
 * @return {!proto.packs.TargetOptions} returns this
 */
proto.packs.TargetOptions.prototype.setTz = function(value) {
  return jspb.Message.setProto3EnumField(this, 7, value);
};


/**
 * optional Secure secure = 8;
 * @return {!proto.packs.Secure}
 */
proto.packs.TargetOptions.prototype.getSecure = function() {
  return /** @type {!proto.packs.Secure} */ (jspb.Message.getFieldWithDefault(this, 8, 0));
};


/**
 * @param {!proto.packs.Secure} value
 * @return {!proto.packs.TargetOptions} returns this
 */
proto.packs.TargetOptions.prototype.setSecure = function(value) {
  return jspb.Message.setProto3EnumField(this, 8, value);
};


/**
 * optional Dsp dsp = 9;
 * @return {!proto.packs.Dsp}
 */
proto.packs.TargetOptions.prototype.getDsp = function() {
  return /** @type {!proto.packs.Dsp} */ (jspb.Message.getFieldWithDefault(this, 9, 0));
};


/**
 * @param {!proto.packs.Dsp} value
 * @return {!proto.packs.TargetOptions} returns this
 */
proto.packs.TargetOptions.prototype.setDsp = function(value) {
  return jspb.Message.setProto3EnumField(this, 9, value);
};


/**
 * optional Mve mve = 10;
 * @return {!proto.packs.Mve}
 */
proto.packs.TargetOptions.prototype.getMve = function() {
  return /** @type {!proto.packs.Mve} */ (jspb.Message.getFieldWithDefault(this, 10, 0));
};


/**
 * @param {!proto.packs.Mve} value
 * @return {!proto.packs.TargetOptions} returns this
 */
proto.packs.TargetOptions.prototype.setMve = function(value) {
  return jspb.Message.setProto3EnumField(this, 10, value);
};


/**
 * optional string cdecp = 11;
 * @return {string}
 */
proto.packs.TargetOptions.prototype.getCdecp = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 11, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.TargetOptions} returns this
 */
proto.packs.TargetOptions.prototype.setCdecp = function(value) {
  return jspb.Message.setField(this, 11, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.packs.TargetOptions} returns this
 */
proto.packs.TargetOptions.prototype.clearCdecp = function() {
  return jspb.Message.setField(this, 11, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.TargetOptions.prototype.hasCdecp = function() {
  return jspb.Message.getField(this, 11) != null;
};


/**
 * optional Pacbti pacbti = 12;
 * @return {!proto.packs.Pacbti}
 */
proto.packs.TargetOptions.prototype.getPacbti = function() {
  return /** @type {!proto.packs.Pacbti} */ (jspb.Message.getFieldWithDefault(this, 12, 0));
};


/**
 * @param {!proto.packs.Pacbti} value
 * @return {!proto.packs.TargetOptions} returns this
 */
proto.packs.TargetOptions.prototype.setPacbti = function(value) {
  return jspb.Message.setProto3EnumField(this, 12, value);
};


/**
 * optional string boardVendor = 13;
 * @return {string}
 */
proto.packs.TargetOptions.prototype.getBoardvendor = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 13, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.TargetOptions} returns this
 */
proto.packs.TargetOptions.prototype.setBoardvendor = function(value) {
  return jspb.Message.setField(this, 13, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.packs.TargetOptions} returns this
 */
proto.packs.TargetOptions.prototype.clearBoardvendor = function() {
  return jspb.Message.setField(this, 13, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.TargetOptions.prototype.hasBoardvendor = function() {
  return jspb.Message.getField(this, 13) != null;
};


/**
 * optional string boardName = 14;
 * @return {string}
 */
proto.packs.TargetOptions.prototype.getBoardname = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 14, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.TargetOptions} returns this
 */
proto.packs.TargetOptions.prototype.setBoardname = function(value) {
  return jspb.Message.setField(this, 14, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.packs.TargetOptions} returns this
 */
proto.packs.TargetOptions.prototype.clearBoardname = function() {
  return jspb.Message.setField(this, 14, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.TargetOptions.prototype.hasBoardname = function() {
  return jspb.Message.getField(this, 14) != null;
};


/**
 * optional string boardRevision = 15;
 * @return {string}
 */
proto.packs.TargetOptions.prototype.getBoardrevision = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 15, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.TargetOptions} returns this
 */
proto.packs.TargetOptions.prototype.setBoardrevision = function(value) {
  return jspb.Message.setField(this, 15, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.packs.TargetOptions} returns this
 */
proto.packs.TargetOptions.prototype.clearBoardrevision = function() {
  return jspb.Message.setField(this, 15, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.TargetOptions.prototype.hasBoardrevision = function() {
  return jspb.Message.getField(this, 15) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.ToolchainOptions.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.ToolchainOptions.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.ToolchainOptions} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ToolchainOptions.toObject = function(includeInstance, msg) {
  var f, obj = {
    compiler: jspb.Message.getFieldWithDefault(msg, 1, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.ToolchainOptions}
 */
proto.packs.ToolchainOptions.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.ToolchainOptions;
  return proto.packs.ToolchainOptions.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.ToolchainOptions} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.ToolchainOptions}
 */
proto.packs.ToolchainOptions.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setCompiler(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.ToolchainOptions.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.ToolchainOptions.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.ToolchainOptions} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ToolchainOptions.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = /** @type {string} */ (jspb.Message.getField(message, 1));
  if (f != null) {
    writer.writeString(
      1,
      f
    );
  }
};


/**
 * optional string compiler = 1;
 * @return {string}
 */
proto.packs.ToolchainOptions.prototype.getCompiler = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.ToolchainOptions} returns this
 */
proto.packs.ToolchainOptions.prototype.setCompiler = function(value) {
  return jspb.Message.setField(this, 1, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.packs.ToolchainOptions} returns this
 */
proto.packs.ToolchainOptions.prototype.clearCompiler = function() {
  return jspb.Message.setField(this, 1, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ToolchainOptions.prototype.hasCompiler = function() {
  return jspb.Message.getField(this, 1) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.ComponentInfo.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.ComponentInfo.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.ComponentInfo} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ComponentInfo.toObject = function(includeInstance, msg) {
  var f, obj = {
    componentId: (f = msg.getComponentId()) && proto.packs.ComponentId.toObject(includeInstance, f),
    description: jspb.Message.getFieldWithDefault(msg, 2, ""),
    isDeviceSpecific: jspb.Message.getBooleanFieldWithDefault(msg, 3, false)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.ComponentInfo}
 */
proto.packs.ComponentInfo.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.ComponentInfo;
  return proto.packs.ComponentInfo.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.ComponentInfo} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.ComponentInfo}
 */
proto.packs.ComponentInfo.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.ComponentId;
      reader.readMessage(value,proto.packs.ComponentId.deserializeBinaryFromReader);
      msg.setComponentId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setDescription(value);
      break;
    case 3:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setIsDeviceSpecific(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.ComponentInfo.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.ComponentInfo.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.ComponentInfo} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ComponentInfo.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getComponentId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.packs.ComponentId.serializeBinaryToWriter
    );
  }
  f = message.getDescription();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getIsDeviceSpecific();
  if (f) {
    writer.writeBool(
      3,
      f
    );
  }
};


/**
 * optional ComponentId component_id = 1;
 * @return {?proto.packs.ComponentId}
 */
proto.packs.ComponentInfo.prototype.getComponentId = function() {
  return /** @type{?proto.packs.ComponentId} */ (
    jspb.Message.getWrapperField(this, proto.packs.ComponentId, 1));
};


/**
 * @param {?proto.packs.ComponentId|undefined} value
 * @return {!proto.packs.ComponentInfo} returns this
*/
proto.packs.ComponentInfo.prototype.setComponentId = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.ComponentInfo} returns this
 */
proto.packs.ComponentInfo.prototype.clearComponentId = function() {
  return this.setComponentId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ComponentInfo.prototype.hasComponentId = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional string description = 2;
 * @return {string}
 */
proto.packs.ComponentInfo.prototype.getDescription = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.ComponentInfo} returns this
 */
proto.packs.ComponentInfo.prototype.setDescription = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional bool is_device_specific = 3;
 * @return {boolean}
 */
proto.packs.ComponentInfo.prototype.getIsDeviceSpecific = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 3, false));
};


/**
 * @param {boolean} value
 * @return {!proto.packs.ComponentInfo} returns this
 */
proto.packs.ComponentInfo.prototype.setIsDeviceSpecific = function(value) {
  return jspb.Message.setProto3BooleanField(this, 3, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.ComponentId.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.ComponentId.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.ComponentId} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ComponentId.toObject = function(includeInstance, msg) {
  var f, obj = {
    packId: (f = msg.getPackId()) && proto.packs.PackId.toObject(includeInstance, f),
    bundleName: jspb.Message.getFieldWithDefault(msg, 2, ""),
    className: jspb.Message.getFieldWithDefault(msg, 3, ""),
    group: jspb.Message.getFieldWithDefault(msg, 4, ""),
    subgroup: jspb.Message.getFieldWithDefault(msg, 5, ""),
    vendor: jspb.Message.getFieldWithDefault(msg, 6, ""),
    version: jspb.Message.getFieldWithDefault(msg, 7, ""),
    variant: jspb.Message.getFieldWithDefault(msg, 8, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.ComponentId}
 */
proto.packs.ComponentId.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.ComponentId;
  return proto.packs.ComponentId.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.ComponentId} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.ComponentId}
 */
proto.packs.ComponentId.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.PackId;
      reader.readMessage(value,proto.packs.PackId.deserializeBinaryFromReader);
      msg.setPackId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setBundleName(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setClassName(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setGroup(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setSubgroup(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readString());
      msg.setVendor(value);
      break;
    case 7:
      var value = /** @type {string} */ (reader.readString());
      msg.setVersion(value);
      break;
    case 8:
      var value = /** @type {string} */ (reader.readString());
      msg.setVariant(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.ComponentId.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.ComponentId.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.ComponentId} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ComponentId.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPackId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.packs.PackId.serializeBinaryToWriter
    );
  }
  f = message.getBundleName();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getClassName();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getGroup();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getSubgroup();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
  f = message.getVendor();
  if (f.length > 0) {
    writer.writeString(
      6,
      f
    );
  }
  f = message.getVersion();
  if (f.length > 0) {
    writer.writeString(
      7,
      f
    );
  }
  f = message.getVariant();
  if (f.length > 0) {
    writer.writeString(
      8,
      f
    );
  }
};


/**
 * optional PackId pack_id = 1;
 * @return {?proto.packs.PackId}
 */
proto.packs.ComponentId.prototype.getPackId = function() {
  return /** @type{?proto.packs.PackId} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackId, 1));
};


/**
 * @param {?proto.packs.PackId|undefined} value
 * @return {!proto.packs.ComponentId} returns this
*/
proto.packs.ComponentId.prototype.setPackId = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.ComponentId} returns this
 */
proto.packs.ComponentId.prototype.clearPackId = function() {
  return this.setPackId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ComponentId.prototype.hasPackId = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional string bundle_name = 2;
 * @return {string}
 */
proto.packs.ComponentId.prototype.getBundleName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.ComponentId} returns this
 */
proto.packs.ComponentId.prototype.setBundleName = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string class_name = 3;
 * @return {string}
 */
proto.packs.ComponentId.prototype.getClassName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.ComponentId} returns this
 */
proto.packs.ComponentId.prototype.setClassName = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string group = 4;
 * @return {string}
 */
proto.packs.ComponentId.prototype.getGroup = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.ComponentId} returns this
 */
proto.packs.ComponentId.prototype.setGroup = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional string subgroup = 5;
 * @return {string}
 */
proto.packs.ComponentId.prototype.getSubgroup = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.ComponentId} returns this
 */
proto.packs.ComponentId.prototype.setSubgroup = function(value) {
  return jspb.Message.setProto3StringField(this, 5, value);
};


/**
 * optional string vendor = 6;
 * @return {string}
 */
proto.packs.ComponentId.prototype.getVendor = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.ComponentId} returns this
 */
proto.packs.ComponentId.prototype.setVendor = function(value) {
  return jspb.Message.setProto3StringField(this, 6, value);
};


/**
 * optional string version = 7;
 * @return {string}
 */
proto.packs.ComponentId.prototype.getVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 7, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.ComponentId} returns this
 */
proto.packs.ComponentId.prototype.setVersion = function(value) {
  return jspb.Message.setProto3StringField(this, 7, value);
};


/**
 * optional string variant = 8;
 * @return {string}
 */
proto.packs.ComponentId.prototype.getVariant = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 8, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.ComponentId} returns this
 */
proto.packs.ComponentId.prototype.setVariant = function(value) {
  return jspb.Message.setProto3StringField(this, 8, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.Doc.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.Doc.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.Doc} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.Doc.toObject = function(includeInstance, msg) {
  var f, obj = {
    doc: (f = msg.getDoc()) && proto.packs.AssetReference.toObject(includeInstance, f),
    description: jspb.Message.getFieldWithDefault(msg, 2, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.Doc}
 */
proto.packs.Doc.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.Doc;
  return proto.packs.Doc.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.Doc} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.Doc}
 */
proto.packs.Doc.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.AssetReference;
      reader.readMessage(value,proto.packs.AssetReference.deserializeBinaryFromReader);
      msg.setDoc(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setDescription(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.Doc.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.Doc.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.Doc} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.Doc.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getDoc();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.packs.AssetReference.serializeBinaryToWriter
    );
  }
  f = message.getDescription();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
};


/**
 * optional AssetReference doc = 1;
 * @return {?proto.packs.AssetReference}
 */
proto.packs.Doc.prototype.getDoc = function() {
  return /** @type{?proto.packs.AssetReference} */ (
    jspb.Message.getWrapperField(this, proto.packs.AssetReference, 1));
};


/**
 * @param {?proto.packs.AssetReference|undefined} value
 * @return {!proto.packs.Doc} returns this
*/
proto.packs.Doc.prototype.setDoc = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.Doc} returns this
 */
proto.packs.Doc.prototype.clearDoc = function() {
  return this.setDoc(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.Doc.prototype.hasDoc = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional string description = 2;
 * @return {string}
 */
proto.packs.Doc.prototype.getDescription = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.Doc} returns this
 */
proto.packs.Doc.prototype.setDescription = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};



/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.packs.ComponentFile.oneofGroups_ = [[5,6]];

/**
 * @enum {number}
 */
proto.packs.ComponentFile.SourceCase = {
  SOURCE_NOT_SET: 0,
  COMPONENT_ID: 5,
  API_ID: 6
};

/**
 * @return {proto.packs.ComponentFile.SourceCase}
 */
proto.packs.ComponentFile.prototype.getSourceCase = function() {
  return /** @type {proto.packs.ComponentFile.SourceCase} */(jspb.Message.computeOneofCase(this, proto.packs.ComponentFile.oneofGroups_[0]));
};



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.ComponentFile.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.ComponentFile.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.ComponentFile} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ComponentFile.toObject = function(includeInstance, msg) {
  var f, obj = {
    file: (f = msg.getFile()) && proto.packs.AssetReference.toObject(includeInstance, f),
    category: jspb.Message.getFieldWithDefault(msg, 2, 0),
    language: jspb.Message.getFieldWithDefault(msg, 3, 0),
    attribute: jspb.Message.getFieldWithDefault(msg, 4, 0),
    componentId: (f = msg.getComponentId()) && proto.packs.ComponentId.toObject(includeInstance, f),
    apiId: (f = msg.getApiId()) && proto.packs.ApiId.toObject(includeInstance, f),
    select: jspb.Message.getFieldWithDefault(msg, 7, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.ComponentFile}
 */
proto.packs.ComponentFile.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.ComponentFile;
  return proto.packs.ComponentFile.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.ComponentFile} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.ComponentFile}
 */
proto.packs.ComponentFile.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.AssetReference;
      reader.readMessage(value,proto.packs.AssetReference.deserializeBinaryFromReader);
      msg.setFile(value);
      break;
    case 2:
      var value = /** @type {!proto.packs.ComponentFile.Category} */ (reader.readEnum());
      msg.setCategory(value);
      break;
    case 3:
      var value = /** @type {!proto.packs.ComponentFile.Language} */ (reader.readEnum());
      msg.setLanguage(value);
      break;
    case 4:
      var value = /** @type {!proto.packs.ComponentFile.Attribute} */ (reader.readEnum());
      msg.setAttribute(value);
      break;
    case 5:
      var value = new proto.packs.ComponentId;
      reader.readMessage(value,proto.packs.ComponentId.deserializeBinaryFromReader);
      msg.setComponentId(value);
      break;
    case 6:
      var value = new proto.packs.ApiId;
      reader.readMessage(value,proto.packs.ApiId.deserializeBinaryFromReader);
      msg.setApiId(value);
      break;
    case 7:
      var value = /** @type {string} */ (reader.readString());
      msg.setSelect(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.ComponentFile.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.ComponentFile.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.ComponentFile} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ComponentFile.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getFile();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.packs.AssetReference.serializeBinaryToWriter
    );
  }
  f = message.getCategory();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = message.getLanguage();
  if (f !== 0.0) {
    writer.writeEnum(
      3,
      f
    );
  }
  f = message.getAttribute();
  if (f !== 0.0) {
    writer.writeEnum(
      4,
      f
    );
  }
  f = message.getComponentId();
  if (f != null) {
    writer.writeMessage(
      5,
      f,
      proto.packs.ComponentId.serializeBinaryToWriter
    );
  }
  f = message.getApiId();
  if (f != null) {
    writer.writeMessage(
      6,
      f,
      proto.packs.ApiId.serializeBinaryToWriter
    );
  }
  f = message.getSelect();
  if (f.length > 0) {
    writer.writeString(
      7,
      f
    );
  }
};


/**
 * @enum {number}
 */
proto.packs.ComponentFile.Category = {
  UNKNOWN_CATEGORY: 0,
  DOC: 1,
  HEADER: 2,
  INCLUDE: 3,
  LIBRARY: 4,
  OBJECT: 5,
  SOURCE: 6,
  LINKER_SCRIPT: 7,
  UTILITY: 8,
  IMAGE: 9,
  PRE_INCLUDE_GLOBAL: 10,
  PRE_INCLUDE_LOCAL: 11
};

/**
 * @enum {number}
 */
proto.packs.ComponentFile.Language = {
  UNKNOWN_LANGUAGE: 0,
  ASM: 1,
  C: 2,
  CPP: 3,
  C_CPP: 4,
  LINK: 5
};

/**
 * @enum {number}
 */
proto.packs.ComponentFile.Attribute = {
  UNKNOWN_ATTRIBUTE: 0,
  CONFIG: 1,
  TEMPLATE: 2
};

/**
 * optional AssetReference file = 1;
 * @return {?proto.packs.AssetReference}
 */
proto.packs.ComponentFile.prototype.getFile = function() {
  return /** @type{?proto.packs.AssetReference} */ (
    jspb.Message.getWrapperField(this, proto.packs.AssetReference, 1));
};


/**
 * @param {?proto.packs.AssetReference|undefined} value
 * @return {!proto.packs.ComponentFile} returns this
*/
proto.packs.ComponentFile.prototype.setFile = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.ComponentFile} returns this
 */
proto.packs.ComponentFile.prototype.clearFile = function() {
  return this.setFile(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ComponentFile.prototype.hasFile = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional Category category = 2;
 * @return {!proto.packs.ComponentFile.Category}
 */
proto.packs.ComponentFile.prototype.getCategory = function() {
  return /** @type {!proto.packs.ComponentFile.Category} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.packs.ComponentFile.Category} value
 * @return {!proto.packs.ComponentFile} returns this
 */
proto.packs.ComponentFile.prototype.setCategory = function(value) {
  return jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * optional Language language = 3;
 * @return {!proto.packs.ComponentFile.Language}
 */
proto.packs.ComponentFile.prototype.getLanguage = function() {
  return /** @type {!proto.packs.ComponentFile.Language} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {!proto.packs.ComponentFile.Language} value
 * @return {!proto.packs.ComponentFile} returns this
 */
proto.packs.ComponentFile.prototype.setLanguage = function(value) {
  return jspb.Message.setProto3EnumField(this, 3, value);
};


/**
 * optional Attribute attribute = 4;
 * @return {!proto.packs.ComponentFile.Attribute}
 */
proto.packs.ComponentFile.prototype.getAttribute = function() {
  return /** @type {!proto.packs.ComponentFile.Attribute} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {!proto.packs.ComponentFile.Attribute} value
 * @return {!proto.packs.ComponentFile} returns this
 */
proto.packs.ComponentFile.prototype.setAttribute = function(value) {
  return jspb.Message.setProto3EnumField(this, 4, value);
};


/**
 * optional ComponentId component_id = 5;
 * @return {?proto.packs.ComponentId}
 */
proto.packs.ComponentFile.prototype.getComponentId = function() {
  return /** @type{?proto.packs.ComponentId} */ (
    jspb.Message.getWrapperField(this, proto.packs.ComponentId, 5));
};


/**
 * @param {?proto.packs.ComponentId|undefined} value
 * @return {!proto.packs.ComponentFile} returns this
*/
proto.packs.ComponentFile.prototype.setComponentId = function(value) {
  return jspb.Message.setOneofWrapperField(this, 5, proto.packs.ComponentFile.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.ComponentFile} returns this
 */
proto.packs.ComponentFile.prototype.clearComponentId = function() {
  return this.setComponentId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ComponentFile.prototype.hasComponentId = function() {
  return jspb.Message.getField(this, 5) != null;
};


/**
 * optional ApiId api_id = 6;
 * @return {?proto.packs.ApiId}
 */
proto.packs.ComponentFile.prototype.getApiId = function() {
  return /** @type{?proto.packs.ApiId} */ (
    jspb.Message.getWrapperField(this, proto.packs.ApiId, 6));
};


/**
 * @param {?proto.packs.ApiId|undefined} value
 * @return {!proto.packs.ComponentFile} returns this
*/
proto.packs.ComponentFile.prototype.setApiId = function(value) {
  return jspb.Message.setOneofWrapperField(this, 6, proto.packs.ComponentFile.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.ComponentFile} returns this
 */
proto.packs.ComponentFile.prototype.clearApiId = function() {
  return this.setApiId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ComponentFile.prototype.hasApiId = function() {
  return jspb.Message.getField(this, 6) != null;
};


/**
 * optional string select = 7;
 * @return {string}
 */
proto.packs.ComponentFile.prototype.getSelect = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 7, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.ComponentFile} returns this
 */
proto.packs.ComponentFile.prototype.setSelect = function(value) {
  return jspb.Message.setProto3StringField(this, 7, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.ApiId.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.ApiId.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.ApiId} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ApiId.toObject = function(includeInstance, msg) {
  var f, obj = {
    packId: (f = msg.getPackId()) && proto.packs.PackId.toObject(includeInstance, f),
    className: jspb.Message.getFieldWithDefault(msg, 2, ""),
    group: jspb.Message.getFieldWithDefault(msg, 3, ""),
    version: jspb.Message.getFieldWithDefault(msg, 4, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.ApiId}
 */
proto.packs.ApiId.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.ApiId;
  return proto.packs.ApiId.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.ApiId} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.ApiId}
 */
proto.packs.ApiId.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.PackId;
      reader.readMessage(value,proto.packs.PackId.deserializeBinaryFromReader);
      msg.setPackId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setClassName(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setGroup(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setVersion(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.ApiId.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.ApiId.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.ApiId} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ApiId.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPackId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.packs.PackId.serializeBinaryToWriter
    );
  }
  f = message.getClassName();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getGroup();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getVersion();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
};


/**
 * optional PackId pack_id = 1;
 * @return {?proto.packs.PackId}
 */
proto.packs.ApiId.prototype.getPackId = function() {
  return /** @type{?proto.packs.PackId} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackId, 1));
};


/**
 * @param {?proto.packs.PackId|undefined} value
 * @return {!proto.packs.ApiId} returns this
*/
proto.packs.ApiId.prototype.setPackId = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.ApiId} returns this
 */
proto.packs.ApiId.prototype.clearPackId = function() {
  return this.setPackId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ApiId.prototype.hasPackId = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional string class_name = 2;
 * @return {string}
 */
proto.packs.ApiId.prototype.getClassName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.ApiId} returns this
 */
proto.packs.ApiId.prototype.setClassName = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string group = 3;
 * @return {string}
 */
proto.packs.ApiId.prototype.getGroup = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.ApiId} returns this
 */
proto.packs.ApiId.prototype.setGroup = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string version = 4;
 * @return {string}
 */
proto.packs.ApiId.prototype.getVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.ApiId} returns this
 */
proto.packs.ApiId.prototype.setVersion = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.ResolveHardwareRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.ResolveHardwareRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.ResolveHardwareRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ResolveHardwareRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    board: (f = msg.getBoard()) && proto.packs.BoardConstraints.toObject(includeInstance, f),
    device: (f = msg.getDevice()) && proto.packs.DeviceConstraints.toObject(includeInstance, f),
    scope: (f = msg.getScope()) && proto.packs.PackScope.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.ResolveHardwareRequest}
 */
proto.packs.ResolveHardwareRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.ResolveHardwareRequest;
  return proto.packs.ResolveHardwareRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.ResolveHardwareRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.ResolveHardwareRequest}
 */
proto.packs.ResolveHardwareRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.BoardConstraints;
      reader.readMessage(value,proto.packs.BoardConstraints.deserializeBinaryFromReader);
      msg.setBoard(value);
      break;
    case 2:
      var value = new proto.packs.DeviceConstraints;
      reader.readMessage(value,proto.packs.DeviceConstraints.deserializeBinaryFromReader);
      msg.setDevice(value);
      break;
    case 3:
      var value = new proto.packs.PackScope;
      reader.readMessage(value,proto.packs.PackScope.deserializeBinaryFromReader);
      msg.setScope(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.ResolveHardwareRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.ResolveHardwareRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.ResolveHardwareRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ResolveHardwareRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBoard();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.packs.BoardConstraints.serializeBinaryToWriter
    );
  }
  f = message.getDevice();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.packs.DeviceConstraints.serializeBinaryToWriter
    );
  }
  f = message.getScope();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.packs.PackScope.serializeBinaryToWriter
    );
  }
};


/**
 * optional BoardConstraints board = 1;
 * @return {?proto.packs.BoardConstraints}
 */
proto.packs.ResolveHardwareRequest.prototype.getBoard = function() {
  return /** @type{?proto.packs.BoardConstraints} */ (
    jspb.Message.getWrapperField(this, proto.packs.BoardConstraints, 1));
};


/**
 * @param {?proto.packs.BoardConstraints|undefined} value
 * @return {!proto.packs.ResolveHardwareRequest} returns this
*/
proto.packs.ResolveHardwareRequest.prototype.setBoard = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.ResolveHardwareRequest} returns this
 */
proto.packs.ResolveHardwareRequest.prototype.clearBoard = function() {
  return this.setBoard(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ResolveHardwareRequest.prototype.hasBoard = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional DeviceConstraints device = 2;
 * @return {?proto.packs.DeviceConstraints}
 */
proto.packs.ResolveHardwareRequest.prototype.getDevice = function() {
  return /** @type{?proto.packs.DeviceConstraints} */ (
    jspb.Message.getWrapperField(this, proto.packs.DeviceConstraints, 2));
};


/**
 * @param {?proto.packs.DeviceConstraints|undefined} value
 * @return {!proto.packs.ResolveHardwareRequest} returns this
*/
proto.packs.ResolveHardwareRequest.prototype.setDevice = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.ResolveHardwareRequest} returns this
 */
proto.packs.ResolveHardwareRequest.prototype.clearDevice = function() {
  return this.setDevice(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ResolveHardwareRequest.prototype.hasDevice = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional PackScope scope = 3;
 * @return {?proto.packs.PackScope}
 */
proto.packs.ResolveHardwareRequest.prototype.getScope = function() {
  return /** @type{?proto.packs.PackScope} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackScope, 3));
};


/**
 * @param {?proto.packs.PackScope|undefined} value
 * @return {!proto.packs.ResolveHardwareRequest} returns this
*/
proto.packs.ResolveHardwareRequest.prototype.setScope = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.ResolveHardwareRequest} returns this
 */
proto.packs.ResolveHardwareRequest.prototype.clearScope = function() {
  return this.setScope(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ResolveHardwareRequest.prototype.hasScope = function() {
  return jspb.Message.getField(this, 3) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.BoardConstraints.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.BoardConstraints.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.BoardConstraints} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.BoardConstraints.toObject = function(includeInstance, msg) {
  var f, obj = {
    vendor: jspb.Message.getFieldWithDefault(msg, 1, ""),
    name: jspb.Message.getFieldWithDefault(msg, 2, ""),
    revision: jspb.Message.getFieldWithDefault(msg, 3, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.BoardConstraints}
 */
proto.packs.BoardConstraints.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.BoardConstraints;
  return proto.packs.BoardConstraints.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.BoardConstraints} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.BoardConstraints}
 */
proto.packs.BoardConstraints.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setVendor(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setName(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setRevision(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.BoardConstraints.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.BoardConstraints.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.BoardConstraints} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.BoardConstraints.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getVendor();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getName();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getRevision();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
};


/**
 * optional string vendor = 1;
 * @return {string}
 */
proto.packs.BoardConstraints.prototype.getVendor = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.BoardConstraints} returns this
 */
proto.packs.BoardConstraints.prototype.setVendor = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string name = 2;
 * @return {string}
 */
proto.packs.BoardConstraints.prototype.getName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.BoardConstraints} returns this
 */
proto.packs.BoardConstraints.prototype.setName = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string revision = 3;
 * @return {string}
 */
proto.packs.BoardConstraints.prototype.getRevision = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.BoardConstraints} returns this
 */
proto.packs.BoardConstraints.prototype.setRevision = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.DeviceConstraints.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.DeviceConstraints.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.DeviceConstraints} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.DeviceConstraints.toObject = function(includeInstance, msg) {
  var f, obj = {
    vendor: jspb.Message.getFieldWithDefault(msg, 1, ""),
    name: jspb.Message.getFieldWithDefault(msg, 2, ""),
    processor: jspb.Message.getFieldWithDefault(msg, 3, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.DeviceConstraints}
 */
proto.packs.DeviceConstraints.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.DeviceConstraints;
  return proto.packs.DeviceConstraints.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.DeviceConstraints} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.DeviceConstraints}
 */
proto.packs.DeviceConstraints.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setVendor(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setName(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setProcessor(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.DeviceConstraints.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.DeviceConstraints.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.DeviceConstraints} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.DeviceConstraints.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getVendor();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getName();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getProcessor();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
};


/**
 * optional string vendor = 1;
 * @return {string}
 */
proto.packs.DeviceConstraints.prototype.getVendor = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.DeviceConstraints} returns this
 */
proto.packs.DeviceConstraints.prototype.setVendor = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string name = 2;
 * @return {string}
 */
proto.packs.DeviceConstraints.prototype.getName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.DeviceConstraints} returns this
 */
proto.packs.DeviceConstraints.prototype.setName = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string processor = 3;
 * @return {string}
 */
proto.packs.DeviceConstraints.prototype.getProcessor = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.DeviceConstraints} returns this
 */
proto.packs.DeviceConstraints.prototype.setProcessor = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.packs.ResolvedHardware.prototype.toObject = function(opt_includeInstance) {
  return proto.packs.ResolvedHardware.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.packs.ResolvedHardware} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ResolvedHardware.toObject = function(includeInstance, msg) {
  var f, obj = {
    board: (f = msg.getBoard()) && proto.packs.BoardId.toObject(includeInstance, f),
    bsp: (f = msg.getBsp()) && proto.packs.PackId.toObject(includeInstance, f),
    device: (f = msg.getDevice()) && proto.packs.DeviceReference.toObject(includeInstance, f),
    processorName: jspb.Message.getFieldWithDefault(msg, 4, ""),
    dfp: (f = msg.getDfp()) && proto.packs.PackId.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.packs.ResolvedHardware}
 */
proto.packs.ResolvedHardware.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.packs.ResolvedHardware;
  return proto.packs.ResolvedHardware.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.packs.ResolvedHardware} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.packs.ResolvedHardware}
 */
proto.packs.ResolvedHardware.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.packs.BoardId;
      reader.readMessage(value,proto.packs.BoardId.deserializeBinaryFromReader);
      msg.setBoard(value);
      break;
    case 2:
      var value = new proto.packs.PackId;
      reader.readMessage(value,proto.packs.PackId.deserializeBinaryFromReader);
      msg.setBsp(value);
      break;
    case 3:
      var value = new proto.packs.DeviceReference;
      reader.readMessage(value,proto.packs.DeviceReference.deserializeBinaryFromReader);
      msg.setDevice(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setProcessorName(value);
      break;
    case 5:
      var value = new proto.packs.PackId;
      reader.readMessage(value,proto.packs.PackId.deserializeBinaryFromReader);
      msg.setDfp(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.packs.ResolvedHardware.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.packs.ResolvedHardware.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.packs.ResolvedHardware} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.packs.ResolvedHardware.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBoard();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.packs.BoardId.serializeBinaryToWriter
    );
  }
  f = message.getBsp();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.packs.PackId.serializeBinaryToWriter
    );
  }
  f = message.getDevice();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.packs.DeviceReference.serializeBinaryToWriter
    );
  }
  f = message.getProcessorName();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getDfp();
  if (f != null) {
    writer.writeMessage(
      5,
      f,
      proto.packs.PackId.serializeBinaryToWriter
    );
  }
};


/**
 * optional BoardId board = 1;
 * @return {?proto.packs.BoardId}
 */
proto.packs.ResolvedHardware.prototype.getBoard = function() {
  return /** @type{?proto.packs.BoardId} */ (
    jspb.Message.getWrapperField(this, proto.packs.BoardId, 1));
};


/**
 * @param {?proto.packs.BoardId|undefined} value
 * @return {!proto.packs.ResolvedHardware} returns this
*/
proto.packs.ResolvedHardware.prototype.setBoard = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.ResolvedHardware} returns this
 */
proto.packs.ResolvedHardware.prototype.clearBoard = function() {
  return this.setBoard(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ResolvedHardware.prototype.hasBoard = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional PackId bsp = 2;
 * @return {?proto.packs.PackId}
 */
proto.packs.ResolvedHardware.prototype.getBsp = function() {
  return /** @type{?proto.packs.PackId} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackId, 2));
};


/**
 * @param {?proto.packs.PackId|undefined} value
 * @return {!proto.packs.ResolvedHardware} returns this
*/
proto.packs.ResolvedHardware.prototype.setBsp = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.ResolvedHardware} returns this
 */
proto.packs.ResolvedHardware.prototype.clearBsp = function() {
  return this.setBsp(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ResolvedHardware.prototype.hasBsp = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional DeviceReference device = 3;
 * @return {?proto.packs.DeviceReference}
 */
proto.packs.ResolvedHardware.prototype.getDevice = function() {
  return /** @type{?proto.packs.DeviceReference} */ (
    jspb.Message.getWrapperField(this, proto.packs.DeviceReference, 3));
};


/**
 * @param {?proto.packs.DeviceReference|undefined} value
 * @return {!proto.packs.ResolvedHardware} returns this
*/
proto.packs.ResolvedHardware.prototype.setDevice = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.ResolvedHardware} returns this
 */
proto.packs.ResolvedHardware.prototype.clearDevice = function() {
  return this.setDevice(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ResolvedHardware.prototype.hasDevice = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional string processor_name = 4;
 * @return {string}
 */
proto.packs.ResolvedHardware.prototype.getProcessorName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.packs.ResolvedHardware} returns this
 */
proto.packs.ResolvedHardware.prototype.setProcessorName = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional PackId dfp = 5;
 * @return {?proto.packs.PackId}
 */
proto.packs.ResolvedHardware.prototype.getDfp = function() {
  return /** @type{?proto.packs.PackId} */ (
    jspb.Message.getWrapperField(this, proto.packs.PackId, 5));
};


/**
 * @param {?proto.packs.PackId|undefined} value
 * @return {!proto.packs.ResolvedHardware} returns this
*/
proto.packs.ResolvedHardware.prototype.setDfp = function(value) {
  return jspb.Message.setWrapperField(this, 5, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.packs.ResolvedHardware} returns this
 */
proto.packs.ResolvedHardware.prototype.clearDfp = function() {
  return this.setDfp(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.packs.ResolvedHardware.prototype.hasDfp = function() {
  return jspb.Message.getField(this, 5) != null;
};


/**
 * @enum {number}
 */
proto.packs.PackScopePreset = {
  PACK_SCOPE_PRESET_UNSPECIFIED: 0,
  PACK_SCOPE_PRESET_CURRENT: 1,
  PACK_SCOPE_PRESET_INSTALLED: 2,
  PACK_SCOPE_PRESET_LATEST: 3
};

/**
 * @enum {number}
 */
proto.packs.Fpu = {
  FPU_UNSPECIFIED: 0,
  FPU_NO: 1,
  FPU: 2,
  FPU_SP: 3,
  FPU_DP: 4
};

/**
 * @enum {number}
 */
proto.packs.Mpu = {
  MPU_UNSPECIFIED: 0,
  MPU_NO: 1,
  MPU: 2
};

/**
 * @enum {number}
 */
proto.packs.Tz = {
  TZ_UNSPECIFIED: 0,
  TZ_NO: 1,
  TZ: 2
};

/**
 * @enum {number}
 */
proto.packs.Secure = {
  SECURE_UNSPECIFIED: 0,
  SECURE_NON_SECURE: 1,
  SECURE: 2,
  SECURE_TZ_DISABLED: 3
};

/**
 * @enum {number}
 */
proto.packs.Dsp = {
  DSP_UNSPECIFIED: 0,
  DSP_NO: 1,
  DSP: 2
};

/**
 * @enum {number}
 */
proto.packs.Mve = {
  MVE_UNSPECIFIED: 0,
  MVE_NO: 1,
  MVE: 2,
  MVE_FP: 3
};

/**
 * @enum {number}
 */
proto.packs.Pacbti = {
  PACBTI_UNSPECIFIED: 0,
  PACBTI_NO: 1,
  PACBTI: 2
};

/**
 * @enum {number}
 */
proto.packs.Endian = {
  ENDIAN_UNSPECIFIED: 0,
  ENDIAN_LITTLE: 1,
  ENDIAN_BIG: 2,
  ENDIAN_CONFIGURABLE: 3
};

goog.object.extend(exports, proto.packs);
