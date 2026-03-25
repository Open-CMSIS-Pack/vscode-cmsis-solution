// source: solutionsproto/solutions.proto
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
var packsproto_packs_pb = require('./packs_pb.js');
goog.object.extend(proto, packsproto_packs_pb);
goog.exportSymbol('proto.solutions.AvailableComponentInfo', null, global);
goog.exportSymbol('proto.solutions.BoardConstraints', null, global);
goog.exportSymbol('proto.solutions.BoardNotFound', null, global);
goog.exportSymbol('proto.solutions.BoardReference', null, global);
goog.exportSymbol('proto.solutions.BranchProtection', null, global);
goog.exportSymbol('proto.solutions.BuildContext', null, global);
goog.exportSymbol('proto.solutions.BuildTypeData', null, global);
goog.exportSymbol('proto.solutions.BuildTypeId', null, global);
goog.exportSymbol('proto.solutions.BuildTypeInSolution', null, global);
goog.exportSymbol('proto.solutions.BuildTypeInfo', null, global);
goog.exportSymbol('proto.solutions.Compiler', null, global);
goog.exportSymbol('proto.solutions.Compiler.Name', null, global);
goog.exportSymbol('proto.solutions.ComponentClassDoc', null, global);
goog.exportSymbol('proto.solutions.ComponentConditionFix', null, global);
goog.exportSymbol('proto.solutions.ComponentConditionFix.TypeCase', null, global);
goog.exportSymbol('proto.solutions.ComponentConditionFixSet', null, global);
goog.exportSymbol('proto.solutions.ComponentData', null, global);
goog.exportSymbol('proto.solutions.ComponentGroupDoc', null, global);
goog.exportSymbol('proto.solutions.ComponentHasDependenciesIncompatibleWithDeviceAndToolchain', null, global);
goog.exportSymbol('proto.solutions.ComponentHasFailingConditions', null, global);
goog.exportSymbol('proto.solutions.ComponentHasUnresolvableDependencies', null, global);
goog.exportSymbol('proto.solutions.ComponentIncompatibleWithDeviceAndToolchain', null, global);
goog.exportSymbol('proto.solutions.ComponentMatchesManyInPackCache', null, global);
goog.exportSymbol('proto.solutions.ComponentMatchesManyInPackScope', null, global);
goog.exportSymbol('proto.solutions.ComponentNotFoundInPackCache', null, global);
goog.exportSymbol('proto.solutions.ComponentNotFoundInPackScope', null, global);
goog.exportSymbol('proto.solutions.ComponentOrigin', null, global);
goog.exportSymbol('proto.solutions.ComponentOrigin.OriginCase', null, global);
goog.exportSymbol('proto.solutions.ComponentReference', null, global);
goog.exportSymbol('proto.solutions.ComponentSelectionRequest', null, global);
goog.exportSymbol('proto.solutions.ComponentValidation', null, global);
goog.exportSymbol('proto.solutions.ComponentValidation.ValidationTypeCase', null, global);
goog.exportSymbol('proto.solutions.ConfigFile', null, global);
goog.exportSymbol('proto.solutions.DefaultConfigurationData', null, global);
goog.exportSymbol('proto.solutions.Device', null, global);
goog.exportSymbol('proto.solutions.DeviceAndToolchainConstraint', null, global);
goog.exportSymbol('proto.solutions.DeviceAndToolchainConstraint.Kind', null, global);
goog.exportSymbol('proto.solutions.DeviceAndToolchainConstraints', null, global);
goog.exportSymbol('proto.solutions.DeviceAndToolchainInfo', null, global);
goog.exportSymbol('proto.solutions.DeviceConstraints', null, global);
goog.exportSymbol('proto.solutions.DeviceNotFound', null, global);
goog.exportSymbol('proto.solutions.Dsp', null, global);
goog.exportSymbol('proto.solutions.Endian', null, global);
goog.exportSymbol('proto.solutions.FilePath', null, global);
goog.exportSymbol('proto.solutions.Fpu', null, global);
goog.exportSymbol('proto.solutions.HardwareOrigin', null, global);
goog.exportSymbol('proto.solutions.HardwareOrigin.OriginCase', null, global);
goog.exportSymbol('proto.solutions.HardwareValidation', null, global);
goog.exportSymbol('proto.solutions.HardwareValidationError', null, global);
goog.exportSymbol('proto.solutions.HardwareValidationError.ErrorTypeCase', null, global);
goog.exportSymbol('proto.solutions.IncludedLayer', null, global);
goog.exportSymbol('proto.solutions.LayerData', null, global);
goog.exportSymbol('proto.solutions.LayerId', null, global);
goog.exportSymbol('proto.solutions.ManyBoardsFound', null, global);
goog.exportSymbol('proto.solutions.Mve', null, global);
goog.exportSymbol('proto.solutions.PackData', null, global);
goog.exportSymbol('proto.solutions.PackOrigin', null, global);
goog.exportSymbol('proto.solutions.PackOrigin.OriginCase', null, global);
goog.exportSymbol('proto.solutions.PackReference', null, global);
goog.exportSymbol('proto.solutions.PackScope', null, global);
goog.exportSymbol('proto.solutions.PackValidation', null, global);
goog.exportSymbol('proto.solutions.PackValidation.ResultCode', null, global);
goog.exportSymbol('proto.solutions.ProcessorData', null, global);
goog.exportSymbol('proto.solutions.ProcessorInfo', null, global);
goog.exportSymbol('proto.solutions.ProcessorMustBeSpecified', null, global);
goog.exportSymbol('proto.solutions.ProcessorNotFoundOnDevice', null, global);
goog.exportSymbol('proto.solutions.ProjectChangeRequest', null, global);
goog.exportSymbol('proto.solutions.ProjectChangeRequest.ChangeCase', null, global);
goog.exportSymbol('proto.solutions.ProjectData', null, global);
goog.exportSymbol('proto.solutions.ProjectId', null, global);
goog.exportSymbol('proto.solutions.ProjectInSolution', null, global);
goog.exportSymbol('proto.solutions.ProjectInfo', null, global);
goog.exportSymbol('proto.solutions.SelectedComponentInfo', null, global);
goog.exportSymbol('proto.solutions.SelectedLayerInfo', null, global);
goog.exportSymbol('proto.solutions.SelectedPackInfo', null, global);
goog.exportSymbol('proto.solutions.Solution', null, global);
goog.exportSymbol('proto.solutions.SolutionChangeRequest', null, global);
goog.exportSymbol('proto.solutions.SolutionChangeRequest.ChangeCase', null, global);
goog.exportSymbol('proto.solutions.SolutionData', null, global);
goog.exportSymbol('proto.solutions.SourcePackMetadata', null, global);
goog.exportSymbol('proto.solutions.TargetTypeData', null, global);
goog.exportSymbol('proto.solutions.TargetTypeId', null, global);
goog.exportSymbol('proto.solutions.TargetTypeInSolution', null, global);
goog.exportSymbol('proto.solutions.TargetTypeInfo', null, global);
goog.exportSymbol('proto.solutions.TrackedComponentReference', null, global);
goog.exportSymbol('proto.solutions.TrackedElement', null, global);
goog.exportSymbol('proto.solutions.TrackedHardware', null, global);
goog.exportSymbol('proto.solutions.TrackedPackReference', null, global);
goog.exportSymbol('proto.solutions.Trustzone', null, global);
goog.exportSymbol('proto.solutions.UnableToResolveDeviceOnBoard', null, global);
goog.exportSymbol('proto.solutions.UnableToResolveDeviceOnMatchingBoards', null, global);
goog.exportSymbol('proto.solutions.ValidationResponse', null, global);
goog.exportSymbol('proto.solutions.ValidationResponse.ValidationResultCase', null, global);
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
proto.solutions.FilePath = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.FilePath, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.FilePath.displayName = 'proto.solutions.FilePath';
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
proto.solutions.ProjectInSolution = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.ProjectInSolution, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.ProjectInSolution.displayName = 'proto.solutions.ProjectInSolution';
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
proto.solutions.ProjectId = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.ProjectId, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.ProjectId.displayName = 'proto.solutions.ProjectId';
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
proto.solutions.ComponentReference = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.ComponentReference, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.ComponentReference.displayName = 'proto.solutions.ComponentReference';
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
proto.solutions.TrackedComponentReference = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.TrackedComponentReference, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.TrackedComponentReference.displayName = 'proto.solutions.TrackedComponentReference';
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
proto.solutions.ComponentOrigin = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.solutions.ComponentOrigin.oneofGroups_);
};
goog.inherits(proto.solutions.ComponentOrigin, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.ComponentOrigin.displayName = 'proto.solutions.ComponentOrigin';
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
proto.solutions.ProjectInfo = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.solutions.ProjectInfo.repeatedFields_, null);
};
goog.inherits(proto.solutions.ProjectInfo, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.ProjectInfo.displayName = 'proto.solutions.ProjectInfo';
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
proto.solutions.LayerId = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.LayerId, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.LayerId.displayName = 'proto.solutions.LayerId';
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
proto.solutions.SolutionChangeRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.solutions.SolutionChangeRequest.oneofGroups_);
};
goog.inherits(proto.solutions.SolutionChangeRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.SolutionChangeRequest.displayName = 'proto.solutions.SolutionChangeRequest';
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
proto.solutions.Device = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.Device, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.Device.displayName = 'proto.solutions.Device';
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
proto.solutions.DeviceAndToolchainInfo = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.DeviceAndToolchainInfo, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.DeviceAndToolchainInfo.displayName = 'proto.solutions.DeviceAndToolchainInfo';
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
proto.solutions.ProcessorInfo = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.ProcessorInfo, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.ProcessorInfo.displayName = 'proto.solutions.ProcessorInfo';
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
proto.solutions.TargetTypeInSolution = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.TargetTypeInSolution, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.TargetTypeInSolution.displayName = 'proto.solutions.TargetTypeInSolution';
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
proto.solutions.TargetTypeId = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.TargetTypeId, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.TargetTypeId.displayName = 'proto.solutions.TargetTypeId';
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
proto.solutions.TargetTypeInfo = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.TargetTypeInfo, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.TargetTypeInfo.displayName = 'proto.solutions.TargetTypeInfo';
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
proto.solutions.BuildTypeInSolution = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.BuildTypeInSolution, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.BuildTypeInSolution.displayName = 'proto.solutions.BuildTypeInSolution';
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
proto.solutions.BuildTypeId = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.BuildTypeId, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.BuildTypeId.displayName = 'proto.solutions.BuildTypeId';
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
proto.solutions.BuildTypeInfo = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.BuildTypeInfo, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.BuildTypeInfo.displayName = 'proto.solutions.BuildTypeInfo';
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
proto.solutions.BuildContext = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.BuildContext, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.BuildContext.displayName = 'proto.solutions.BuildContext';
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
proto.solutions.ProjectChangeRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.solutions.ProjectChangeRequest.oneofGroups_);
};
goog.inherits(proto.solutions.ProjectChangeRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.ProjectChangeRequest.displayName = 'proto.solutions.ProjectChangeRequest';
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
proto.solutions.ValidationResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.solutions.ValidationResponse.oneofGroups_);
};
goog.inherits(proto.solutions.ValidationResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.ValidationResponse.displayName = 'proto.solutions.ValidationResponse';
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
proto.solutions.AvailableComponentInfo = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.AvailableComponentInfo, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.AvailableComponentInfo.displayName = 'proto.solutions.AvailableComponentInfo';
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
proto.solutions.SourcePackMetadata = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.SourcePackMetadata, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.SourcePackMetadata.displayName = 'proto.solutions.SourcePackMetadata';
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
proto.solutions.SelectedComponentInfo = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.solutions.SelectedComponentInfo.repeatedFields_, null);
};
goog.inherits(proto.solutions.SelectedComponentInfo, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.SelectedComponentInfo.displayName = 'proto.solutions.SelectedComponentInfo';
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
proto.solutions.ConfigFile = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.ConfigFile, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.ConfigFile.displayName = 'proto.solutions.ConfigFile';
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
proto.solutions.SelectedLayerInfo = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.SelectedLayerInfo, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.SelectedLayerInfo.displayName = 'proto.solutions.SelectedLayerInfo';
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
proto.solutions.ComponentSelectionRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.solutions.ComponentSelectionRequest.repeatedFields_, null);
};
goog.inherits(proto.solutions.ComponentSelectionRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.ComponentSelectionRequest.displayName = 'proto.solutions.ComponentSelectionRequest';
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
proto.solutions.ComponentValidation = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.solutions.ComponentValidation.oneofGroups_);
};
goog.inherits(proto.solutions.ComponentValidation, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.ComponentValidation.displayName = 'proto.solutions.ComponentValidation';
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
proto.solutions.ComponentNotFoundInPackCache = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.ComponentNotFoundInPackCache, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.ComponentNotFoundInPackCache.displayName = 'proto.solutions.ComponentNotFoundInPackCache';
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
proto.solutions.ComponentNotFoundInPackScope = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.solutions.ComponentNotFoundInPackScope.repeatedFields_, null);
};
goog.inherits(proto.solutions.ComponentNotFoundInPackScope, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.ComponentNotFoundInPackScope.displayName = 'proto.solutions.ComponentNotFoundInPackScope';
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
proto.solutions.ComponentMatchesManyInPackCache = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.solutions.ComponentMatchesManyInPackCache.repeatedFields_, null);
};
goog.inherits(proto.solutions.ComponentMatchesManyInPackCache, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.ComponentMatchesManyInPackCache.displayName = 'proto.solutions.ComponentMatchesManyInPackCache';
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
proto.solutions.ComponentMatchesManyInPackScope = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.solutions.ComponentMatchesManyInPackScope.repeatedFields_, null);
};
goog.inherits(proto.solutions.ComponentMatchesManyInPackScope, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.ComponentMatchesManyInPackScope.displayName = 'proto.solutions.ComponentMatchesManyInPackScope';
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
proto.solutions.ComponentIncompatibleWithDeviceAndToolchain = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.solutions.ComponentIncompatibleWithDeviceAndToolchain.repeatedFields_, null);
};
goog.inherits(proto.solutions.ComponentIncompatibleWithDeviceAndToolchain, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.ComponentIncompatibleWithDeviceAndToolchain.displayName = 'proto.solutions.ComponentIncompatibleWithDeviceAndToolchain';
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
proto.solutions.DeviceAndToolchainConstraints = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.DeviceAndToolchainConstraints, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.DeviceAndToolchainConstraints.displayName = 'proto.solutions.DeviceAndToolchainConstraints';
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
proto.solutions.DeviceAndToolchainConstraint = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.DeviceAndToolchainConstraint, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.DeviceAndToolchainConstraint.displayName = 'proto.solutions.DeviceAndToolchainConstraint';
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
proto.solutions.ComponentHasFailingConditions = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.solutions.ComponentHasFailingConditions.repeatedFields_, null);
};
goog.inherits(proto.solutions.ComponentHasFailingConditions, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.ComponentHasFailingConditions.displayName = 'proto.solutions.ComponentHasFailingConditions';
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
proto.solutions.ComponentConditionFixSet = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.solutions.ComponentConditionFixSet.repeatedFields_, null);
};
goog.inherits(proto.solutions.ComponentConditionFixSet, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.ComponentConditionFixSet.displayName = 'proto.solutions.ComponentConditionFixSet';
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
proto.solutions.ComponentConditionFix = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.solutions.ComponentConditionFix.oneofGroups_);
};
goog.inherits(proto.solutions.ComponentConditionFix, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.ComponentConditionFix.displayName = 'proto.solutions.ComponentConditionFix';
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
proto.solutions.PackValidation = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.PackValidation, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.PackValidation.displayName = 'proto.solutions.PackValidation';
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
proto.solutions.ComponentHasUnresolvableDependencies = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.ComponentHasUnresolvableDependencies, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.ComponentHasUnresolvableDependencies.displayName = 'proto.solutions.ComponentHasUnresolvableDependencies';
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
proto.solutions.ComponentHasDependenciesIncompatibleWithDeviceAndToolchain = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.ComponentHasDependenciesIncompatibleWithDeviceAndToolchain, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.ComponentHasDependenciesIncompatibleWithDeviceAndToolchain.displayName = 'proto.solutions.ComponentHasDependenciesIncompatibleWithDeviceAndToolchain';
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
proto.solutions.HardwareValidation = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.HardwareValidation, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.HardwareValidation.displayName = 'proto.solutions.HardwareValidation';
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
proto.solutions.TrackedHardware = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.TrackedHardware, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.TrackedHardware.displayName = 'proto.solutions.TrackedHardware';
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
proto.solutions.TrackedElement = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.TrackedElement, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.TrackedElement.displayName = 'proto.solutions.TrackedElement';
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
proto.solutions.HardwareOrigin = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.solutions.HardwareOrigin.oneofGroups_);
};
goog.inherits(proto.solutions.HardwareOrigin, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.HardwareOrigin.displayName = 'proto.solutions.HardwareOrigin';
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
proto.solutions.HardwareValidationError = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.solutions.HardwareValidationError.oneofGroups_);
};
goog.inherits(proto.solutions.HardwareValidationError, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.HardwareValidationError.displayName = 'proto.solutions.HardwareValidationError';
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
proto.solutions.BoardNotFound = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.BoardNotFound, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.BoardNotFound.displayName = 'proto.solutions.BoardNotFound';
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
proto.solutions.ManyBoardsFound = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.solutions.ManyBoardsFound.repeatedFields_, null);
};
goog.inherits(proto.solutions.ManyBoardsFound, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.ManyBoardsFound.displayName = 'proto.solutions.ManyBoardsFound';
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
proto.solutions.UnableToResolveDeviceOnMatchingBoards = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.solutions.UnableToResolveDeviceOnMatchingBoards.repeatedFields_, null);
};
goog.inherits(proto.solutions.UnableToResolveDeviceOnMatchingBoards, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.UnableToResolveDeviceOnMatchingBoards.displayName = 'proto.solutions.UnableToResolveDeviceOnMatchingBoards';
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
proto.solutions.UnableToResolveDeviceOnBoard = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.UnableToResolveDeviceOnBoard, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.UnableToResolveDeviceOnBoard.displayName = 'proto.solutions.UnableToResolveDeviceOnBoard';
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
proto.solutions.DeviceNotFound = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.DeviceNotFound, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.DeviceNotFound.displayName = 'proto.solutions.DeviceNotFound';
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
proto.solutions.ProcessorNotFoundOnDevice = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.ProcessorNotFoundOnDevice, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.ProcessorNotFoundOnDevice.displayName = 'proto.solutions.ProcessorNotFoundOnDevice';
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
proto.solutions.ProcessorMustBeSpecified = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.ProcessorMustBeSpecified, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.ProcessorMustBeSpecified.displayName = 'proto.solutions.ProcessorMustBeSpecified';
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
proto.solutions.BoardConstraints = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.BoardConstraints, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.BoardConstraints.displayName = 'proto.solutions.BoardConstraints';
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
proto.solutions.DeviceConstraints = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.DeviceConstraints, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.DeviceConstraints.displayName = 'proto.solutions.DeviceConstraints';
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
proto.solutions.PackScope = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.solutions.PackScope.repeatedFields_, null);
};
goog.inherits(proto.solutions.PackScope, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.PackScope.displayName = 'proto.solutions.PackScope';
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
proto.solutions.ComponentClassDoc = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.ComponentClassDoc, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.ComponentClassDoc.displayName = 'proto.solutions.ComponentClassDoc';
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
proto.solutions.ComponentGroupDoc = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.ComponentGroupDoc, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.ComponentGroupDoc.displayName = 'proto.solutions.ComponentGroupDoc';
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
proto.solutions.SelectedPackInfo = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.SelectedPackInfo, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.SelectedPackInfo.displayName = 'proto.solutions.SelectedPackInfo';
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
proto.solutions.PackReference = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.PackReference, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.PackReference.displayName = 'proto.solutions.PackReference';
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
proto.solutions.TrackedPackReference = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.TrackedPackReference, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.TrackedPackReference.displayName = 'proto.solutions.TrackedPackReference';
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
proto.solutions.Solution = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.Solution, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.Solution.displayName = 'proto.solutions.Solution';
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
proto.solutions.PackOrigin = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.solutions.PackOrigin.oneofGroups_);
};
goog.inherits(proto.solutions.PackOrigin, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.PackOrigin.displayName = 'proto.solutions.PackOrigin';
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
proto.solutions.SolutionData = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.solutions.SolutionData.repeatedFields_, null);
};
goog.inherits(proto.solutions.SolutionData, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.SolutionData.displayName = 'proto.solutions.SolutionData';
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
proto.solutions.TargetTypeData = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.TargetTypeData, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.TargetTypeData.displayName = 'proto.solutions.TargetTypeData';
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
proto.solutions.BuildTypeData = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.BuildTypeData, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.BuildTypeData.displayName = 'proto.solutions.BuildTypeData';
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
proto.solutions.ProjectData = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.solutions.ProjectData.repeatedFields_, null);
};
goog.inherits(proto.solutions.ProjectData, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.ProjectData.displayName = 'proto.solutions.ProjectData';
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
proto.solutions.PackData = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.solutions.PackData.repeatedFields_, null);
};
goog.inherits(proto.solutions.PackData, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.PackData.displayName = 'proto.solutions.PackData';
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
proto.solutions.ComponentData = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.solutions.ComponentData.repeatedFields_, null);
};
goog.inherits(proto.solutions.ComponentData, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.ComponentData.displayName = 'proto.solutions.ComponentData';
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
proto.solutions.ProcessorData = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.ProcessorData, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.ProcessorData.displayName = 'proto.solutions.ProcessorData';
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
proto.solutions.Compiler = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.Compiler, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.Compiler.displayName = 'proto.solutions.Compiler';
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
proto.solutions.BoardReference = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.BoardReference, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.BoardReference.displayName = 'proto.solutions.BoardReference';
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
proto.solutions.LayerData = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.solutions.LayerData.repeatedFields_, null);
};
goog.inherits(proto.solutions.LayerData, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.LayerData.displayName = 'proto.solutions.LayerData';
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
proto.solutions.IncludedLayer = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.solutions.IncludedLayer.repeatedFields_, null);
};
goog.inherits(proto.solutions.IncludedLayer, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.IncludedLayer.displayName = 'proto.solutions.IncludedLayer';
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
proto.solutions.DefaultConfigurationData = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.solutions.DefaultConfigurationData, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.solutions.DefaultConfigurationData.displayName = 'proto.solutions.DefaultConfigurationData';
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.FilePath.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.FilePath.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.FilePath} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.FilePath.toObject = function(includeInstance, msg) {
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
 * @return {!proto.solutions.FilePath}
 */
proto.solutions.FilePath.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.FilePath;
  return proto.solutions.FilePath.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.FilePath} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.FilePath}
 */
proto.solutions.FilePath.deserializeBinaryFromReader = function(msg, reader) {
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
proto.solutions.FilePath.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.FilePath.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.FilePath} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.FilePath.serializeBinaryToWriter = function(message, writer) {
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
proto.solutions.FilePath.prototype.getPath = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.FilePath} returns this
 */
proto.solutions.FilePath.prototype.setPath = function(value) {
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.ProjectInSolution.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.ProjectInSolution.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.ProjectInSolution} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ProjectInSolution.toObject = function(includeInstance, msg) {
  var f, obj = {
    solution: (f = msg.getSolution()) && proto.solutions.SolutionData.toObject(includeInstance, f),
    projectId: (f = msg.getProjectId()) && proto.solutions.ProjectId.toObject(includeInstance, f)
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
 * @return {!proto.solutions.ProjectInSolution}
 */
proto.solutions.ProjectInSolution.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.ProjectInSolution;
  return proto.solutions.ProjectInSolution.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.ProjectInSolution} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.ProjectInSolution}
 */
proto.solutions.ProjectInSolution.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.SolutionData;
      reader.readMessage(value,proto.solutions.SolutionData.deserializeBinaryFromReader);
      msg.setSolution(value);
      break;
    case 2:
      var value = new proto.solutions.ProjectId;
      reader.readMessage(value,proto.solutions.ProjectId.deserializeBinaryFromReader);
      msg.setProjectId(value);
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
proto.solutions.ProjectInSolution.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.ProjectInSolution.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.ProjectInSolution} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ProjectInSolution.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSolution();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.SolutionData.serializeBinaryToWriter
    );
  }
  f = message.getProjectId();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.solutions.ProjectId.serializeBinaryToWriter
    );
  }
};


/**
 * optional SolutionData solution = 1;
 * @return {?proto.solutions.SolutionData}
 */
proto.solutions.ProjectInSolution.prototype.getSolution = function() {
  return /** @type{?proto.solutions.SolutionData} */ (
    jspb.Message.getWrapperField(this, proto.solutions.SolutionData, 1));
};


/**
 * @param {?proto.solutions.SolutionData|undefined} value
 * @return {!proto.solutions.ProjectInSolution} returns this
*/
proto.solutions.ProjectInSolution.prototype.setSolution = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ProjectInSolution} returns this
 */
proto.solutions.ProjectInSolution.prototype.clearSolution = function() {
  return this.setSolution(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ProjectInSolution.prototype.hasSolution = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional ProjectId project_id = 2;
 * @return {?proto.solutions.ProjectId}
 */
proto.solutions.ProjectInSolution.prototype.getProjectId = function() {
  return /** @type{?proto.solutions.ProjectId} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ProjectId, 2));
};


/**
 * @param {?proto.solutions.ProjectId|undefined} value
 * @return {!proto.solutions.ProjectInSolution} returns this
*/
proto.solutions.ProjectInSolution.prototype.setProjectId = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ProjectInSolution} returns this
 */
proto.solutions.ProjectInSolution.prototype.clearProjectId = function() {
  return this.setProjectId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ProjectInSolution.prototype.hasProjectId = function() {
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.ProjectId.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.ProjectId.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.ProjectId} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ProjectId.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: jspb.Message.getFieldWithDefault(msg, 1, "")
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
 * @return {!proto.solutions.ProjectId}
 */
proto.solutions.ProjectId.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.ProjectId;
  return proto.solutions.ProjectId.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.ProjectId} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.ProjectId}
 */
proto.solutions.ProjectId.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
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
proto.solutions.ProjectId.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.ProjectId.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.ProjectId} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ProjectId.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
};


/**
 * optional string id = 1;
 * @return {string}
 */
proto.solutions.ProjectId.prototype.getId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.ProjectId} returns this
 */
proto.solutions.ProjectId.prototype.setId = function(value) {
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.ComponentReference.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.ComponentReference.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.ComponentReference} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentReference.toObject = function(includeInstance, msg) {
  var f, obj = {
    bundleName: jspb.Message.getFieldWithDefault(msg, 1, ""),
    className: jspb.Message.getFieldWithDefault(msg, 2, ""),
    group: jspb.Message.getFieldWithDefault(msg, 3, ""),
    subgroup: jspb.Message.getFieldWithDefault(msg, 4, ""),
    vendor: jspb.Message.getFieldWithDefault(msg, 5, ""),
    version: jspb.Message.getFieldWithDefault(msg, 6, ""),
    variant: jspb.Message.getFieldWithDefault(msg, 7, "")
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
 * @return {!proto.solutions.ComponentReference}
 */
proto.solutions.ComponentReference.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.ComponentReference;
  return proto.solutions.ComponentReference.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.ComponentReference} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.ComponentReference}
 */
proto.solutions.ComponentReference.deserializeBinaryFromReader = function(msg, reader) {
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
proto.solutions.ComponentReference.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.ComponentReference.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.ComponentReference} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentReference.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBundleName();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
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
  f = message.getSubgroup();
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
  f = message.getVersion();
  if (f.length > 0) {
    writer.writeString(
      6,
      f
    );
  }
  f = message.getVariant();
  if (f.length > 0) {
    writer.writeString(
      7,
      f
    );
  }
};


/**
 * optional string bundle_name = 1;
 * @return {string}
 */
proto.solutions.ComponentReference.prototype.getBundleName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.ComponentReference} returns this
 */
proto.solutions.ComponentReference.prototype.setBundleName = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string class_name = 2;
 * @return {string}
 */
proto.solutions.ComponentReference.prototype.getClassName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.ComponentReference} returns this
 */
proto.solutions.ComponentReference.prototype.setClassName = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string group = 3;
 * @return {string}
 */
proto.solutions.ComponentReference.prototype.getGroup = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.ComponentReference} returns this
 */
proto.solutions.ComponentReference.prototype.setGroup = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string subgroup = 4;
 * @return {string}
 */
proto.solutions.ComponentReference.prototype.getSubgroup = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.ComponentReference} returns this
 */
proto.solutions.ComponentReference.prototype.setSubgroup = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional string vendor = 5;
 * @return {string}
 */
proto.solutions.ComponentReference.prototype.getVendor = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.ComponentReference} returns this
 */
proto.solutions.ComponentReference.prototype.setVendor = function(value) {
  return jspb.Message.setProto3StringField(this, 5, value);
};


/**
 * optional string version = 6;
 * @return {string}
 */
proto.solutions.ComponentReference.prototype.getVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.ComponentReference} returns this
 */
proto.solutions.ComponentReference.prototype.setVersion = function(value) {
  return jspb.Message.setProto3StringField(this, 6, value);
};


/**
 * optional string variant = 7;
 * @return {string}
 */
proto.solutions.ComponentReference.prototype.getVariant = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 7, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.ComponentReference} returns this
 */
proto.solutions.ComponentReference.prototype.setVariant = function(value) {
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.TrackedComponentReference.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.TrackedComponentReference.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.TrackedComponentReference} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.TrackedComponentReference.toObject = function(includeInstance, msg) {
  var f, obj = {
    reference: (f = msg.getReference()) && proto.solutions.ComponentReference.toObject(includeInstance, f),
    origin: (f = msg.getOrigin()) && proto.solutions.ComponentOrigin.toObject(includeInstance, f)
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
 * @return {!proto.solutions.TrackedComponentReference}
 */
proto.solutions.TrackedComponentReference.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.TrackedComponentReference;
  return proto.solutions.TrackedComponentReference.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.TrackedComponentReference} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.TrackedComponentReference}
 */
proto.solutions.TrackedComponentReference.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.ComponentReference;
      reader.readMessage(value,proto.solutions.ComponentReference.deserializeBinaryFromReader);
      msg.setReference(value);
      break;
    case 2:
      var value = new proto.solutions.ComponentOrigin;
      reader.readMessage(value,proto.solutions.ComponentOrigin.deserializeBinaryFromReader);
      msg.setOrigin(value);
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
proto.solutions.TrackedComponentReference.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.TrackedComponentReference.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.TrackedComponentReference} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.TrackedComponentReference.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getReference();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.ComponentReference.serializeBinaryToWriter
    );
  }
  f = message.getOrigin();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.solutions.ComponentOrigin.serializeBinaryToWriter
    );
  }
};


/**
 * optional ComponentReference reference = 1;
 * @return {?proto.solutions.ComponentReference}
 */
proto.solutions.TrackedComponentReference.prototype.getReference = function() {
  return /** @type{?proto.solutions.ComponentReference} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ComponentReference, 1));
};


/**
 * @param {?proto.solutions.ComponentReference|undefined} value
 * @return {!proto.solutions.TrackedComponentReference} returns this
*/
proto.solutions.TrackedComponentReference.prototype.setReference = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.TrackedComponentReference} returns this
 */
proto.solutions.TrackedComponentReference.prototype.clearReference = function() {
  return this.setReference(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.TrackedComponentReference.prototype.hasReference = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional ComponentOrigin origin = 2;
 * @return {?proto.solutions.ComponentOrigin}
 */
proto.solutions.TrackedComponentReference.prototype.getOrigin = function() {
  return /** @type{?proto.solutions.ComponentOrigin} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ComponentOrigin, 2));
};


/**
 * @param {?proto.solutions.ComponentOrigin|undefined} value
 * @return {!proto.solutions.TrackedComponentReference} returns this
*/
proto.solutions.TrackedComponentReference.prototype.setOrigin = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.TrackedComponentReference} returns this
 */
proto.solutions.TrackedComponentReference.prototype.clearOrigin = function() {
  return this.setOrigin(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.TrackedComponentReference.prototype.hasOrigin = function() {
  return jspb.Message.getField(this, 2) != null;
};



/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.solutions.ComponentOrigin.oneofGroups_ = [[1,2]];

/**
 * @enum {number}
 */
proto.solutions.ComponentOrigin.OriginCase = {
  ORIGIN_NOT_SET: 0,
  PROJECT_ID: 1,
  LAYER_ID: 2
};

/**
 * @return {proto.solutions.ComponentOrigin.OriginCase}
 */
proto.solutions.ComponentOrigin.prototype.getOriginCase = function() {
  return /** @type {proto.solutions.ComponentOrigin.OriginCase} */(jspb.Message.computeOneofCase(this, proto.solutions.ComponentOrigin.oneofGroups_[0]));
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.ComponentOrigin.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.ComponentOrigin.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.ComponentOrigin} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentOrigin.toObject = function(includeInstance, msg) {
  var f, obj = {
    projectId: (f = msg.getProjectId()) && proto.solutions.ProjectId.toObject(includeInstance, f),
    layerId: (f = msg.getLayerId()) && proto.solutions.LayerId.toObject(includeInstance, f)
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
 * @return {!proto.solutions.ComponentOrigin}
 */
proto.solutions.ComponentOrigin.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.ComponentOrigin;
  return proto.solutions.ComponentOrigin.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.ComponentOrigin} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.ComponentOrigin}
 */
proto.solutions.ComponentOrigin.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.ProjectId;
      reader.readMessage(value,proto.solutions.ProjectId.deserializeBinaryFromReader);
      msg.setProjectId(value);
      break;
    case 2:
      var value = new proto.solutions.LayerId;
      reader.readMessage(value,proto.solutions.LayerId.deserializeBinaryFromReader);
      msg.setLayerId(value);
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
proto.solutions.ComponentOrigin.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.ComponentOrigin.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.ComponentOrigin} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentOrigin.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getProjectId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.ProjectId.serializeBinaryToWriter
    );
  }
  f = message.getLayerId();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.solutions.LayerId.serializeBinaryToWriter
    );
  }
};


/**
 * optional ProjectId project_id = 1;
 * @return {?proto.solutions.ProjectId}
 */
proto.solutions.ComponentOrigin.prototype.getProjectId = function() {
  return /** @type{?proto.solutions.ProjectId} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ProjectId, 1));
};


/**
 * @param {?proto.solutions.ProjectId|undefined} value
 * @return {!proto.solutions.ComponentOrigin} returns this
*/
proto.solutions.ComponentOrigin.prototype.setProjectId = function(value) {
  return jspb.Message.setOneofWrapperField(this, 1, proto.solutions.ComponentOrigin.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ComponentOrigin} returns this
 */
proto.solutions.ComponentOrigin.prototype.clearProjectId = function() {
  return this.setProjectId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ComponentOrigin.prototype.hasProjectId = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional LayerId layer_id = 2;
 * @return {?proto.solutions.LayerId}
 */
proto.solutions.ComponentOrigin.prototype.getLayerId = function() {
  return /** @type{?proto.solutions.LayerId} */ (
    jspb.Message.getWrapperField(this, proto.solutions.LayerId, 2));
};


/**
 * @param {?proto.solutions.LayerId|undefined} value
 * @return {!proto.solutions.ComponentOrigin} returns this
*/
proto.solutions.ComponentOrigin.prototype.setLayerId = function(value) {
  return jspb.Message.setOneofWrapperField(this, 2, proto.solutions.ComponentOrigin.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ComponentOrigin} returns this
 */
proto.solutions.ComponentOrigin.prototype.clearLayerId = function() {
  return this.setLayerId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ComponentOrigin.prototype.hasLayerId = function() {
  return jspb.Message.getField(this, 2) != null;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.solutions.ProjectInfo.repeatedFields_ = [2,3];



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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.ProjectInfo.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.ProjectInfo.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.ProjectInfo} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ProjectInfo.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: (f = msg.getId()) && proto.solutions.ProjectId.toObject(includeInstance, f),
    contextsList: jspb.Message.toObjectList(msg.getContextsList(),
    proto.solutions.BuildContext.toObject, includeInstance),
    componentsList: jspb.Message.toObjectList(msg.getComponentsList(),
    proto.solutions.ComponentReference.toObject, includeInstance)
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
 * @return {!proto.solutions.ProjectInfo}
 */
proto.solutions.ProjectInfo.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.ProjectInfo;
  return proto.solutions.ProjectInfo.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.ProjectInfo} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.ProjectInfo}
 */
proto.solutions.ProjectInfo.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.ProjectId;
      reader.readMessage(value,proto.solutions.ProjectId.deserializeBinaryFromReader);
      msg.setId(value);
      break;
    case 2:
      var value = new proto.solutions.BuildContext;
      reader.readMessage(value,proto.solutions.BuildContext.deserializeBinaryFromReader);
      msg.addContexts(value);
      break;
    case 3:
      var value = new proto.solutions.ComponentReference;
      reader.readMessage(value,proto.solutions.ComponentReference.deserializeBinaryFromReader);
      msg.addComponents(value);
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
proto.solutions.ProjectInfo.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.ProjectInfo.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.ProjectInfo} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ProjectInfo.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.ProjectId.serializeBinaryToWriter
    );
  }
  f = message.getContextsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      2,
      f,
      proto.solutions.BuildContext.serializeBinaryToWriter
    );
  }
  f = message.getComponentsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      proto.solutions.ComponentReference.serializeBinaryToWriter
    );
  }
};


/**
 * optional ProjectId id = 1;
 * @return {?proto.solutions.ProjectId}
 */
proto.solutions.ProjectInfo.prototype.getId = function() {
  return /** @type{?proto.solutions.ProjectId} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ProjectId, 1));
};


/**
 * @param {?proto.solutions.ProjectId|undefined} value
 * @return {!proto.solutions.ProjectInfo} returns this
*/
proto.solutions.ProjectInfo.prototype.setId = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ProjectInfo} returns this
 */
proto.solutions.ProjectInfo.prototype.clearId = function() {
  return this.setId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ProjectInfo.prototype.hasId = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * repeated BuildContext contexts = 2;
 * @return {!Array<!proto.solutions.BuildContext>}
 */
proto.solutions.ProjectInfo.prototype.getContextsList = function() {
  return /** @type{!Array<!proto.solutions.BuildContext>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.solutions.BuildContext, 2));
};


/**
 * @param {!Array<!proto.solutions.BuildContext>} value
 * @return {!proto.solutions.ProjectInfo} returns this
*/
proto.solutions.ProjectInfo.prototype.setContextsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 2, value);
};


/**
 * @param {!proto.solutions.BuildContext=} opt_value
 * @param {number=} opt_index
 * @return {!proto.solutions.BuildContext}
 */
proto.solutions.ProjectInfo.prototype.addContexts = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 2, opt_value, proto.solutions.BuildContext, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.ProjectInfo} returns this
 */
proto.solutions.ProjectInfo.prototype.clearContextsList = function() {
  return this.setContextsList([]);
};


/**
 * repeated ComponentReference components = 3;
 * @return {!Array<!proto.solutions.ComponentReference>}
 */
proto.solutions.ProjectInfo.prototype.getComponentsList = function() {
  return /** @type{!Array<!proto.solutions.ComponentReference>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.solutions.ComponentReference, 3));
};


/**
 * @param {!Array<!proto.solutions.ComponentReference>} value
 * @return {!proto.solutions.ProjectInfo} returns this
*/
proto.solutions.ProjectInfo.prototype.setComponentsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.solutions.ComponentReference=} opt_value
 * @param {number=} opt_index
 * @return {!proto.solutions.ComponentReference}
 */
proto.solutions.ProjectInfo.prototype.addComponents = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.solutions.ComponentReference, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.ProjectInfo} returns this
 */
proto.solutions.ProjectInfo.prototype.clearComponentsList = function() {
  return this.setComponentsList([]);
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.LayerId.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.LayerId.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.LayerId} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.LayerId.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: jspb.Message.getFieldWithDefault(msg, 1, "")
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
 * @return {!proto.solutions.LayerId}
 */
proto.solutions.LayerId.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.LayerId;
  return proto.solutions.LayerId.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.LayerId} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.LayerId}
 */
proto.solutions.LayerId.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
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
proto.solutions.LayerId.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.LayerId.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.LayerId} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.LayerId.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
};


/**
 * optional string id = 1;
 * @return {string}
 */
proto.solutions.LayerId.prototype.getId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.LayerId} returns this
 */
proto.solutions.LayerId.prototype.setId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};



/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.solutions.SolutionChangeRequest.oneofGroups_ = [[3,4]];

/**
 * @enum {number}
 */
proto.solutions.SolutionChangeRequest.ChangeCase = {
  CHANGE_NOT_SET: 0,
  ADD_PACK: 3,
  REMOVE_PACK: 4
};

/**
 * @return {proto.solutions.SolutionChangeRequest.ChangeCase}
 */
proto.solutions.SolutionChangeRequest.prototype.getChangeCase = function() {
  return /** @type {proto.solutions.SolutionChangeRequest.ChangeCase} */(jspb.Message.computeOneofCase(this, proto.solutions.SolutionChangeRequest.oneofGroups_[0]));
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.SolutionChangeRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.SolutionChangeRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.SolutionChangeRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.SolutionChangeRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    solution: (f = msg.getSolution()) && proto.solutions.SolutionData.toObject(includeInstance, f),
    addPack: (f = msg.getAddPack()) && packsproto_packs_pb.PackId.toObject(includeInstance, f),
    removePack: (f = msg.getRemovePack()) && packsproto_packs_pb.PackId.toObject(includeInstance, f)
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
 * @return {!proto.solutions.SolutionChangeRequest}
 */
proto.solutions.SolutionChangeRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.SolutionChangeRequest;
  return proto.solutions.SolutionChangeRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.SolutionChangeRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.SolutionChangeRequest}
 */
proto.solutions.SolutionChangeRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 5:
      var value = new proto.solutions.SolutionData;
      reader.readMessage(value,proto.solutions.SolutionData.deserializeBinaryFromReader);
      msg.setSolution(value);
      break;
    case 3:
      var value = new packsproto_packs_pb.PackId;
      reader.readMessage(value,packsproto_packs_pb.PackId.deserializeBinaryFromReader);
      msg.setAddPack(value);
      break;
    case 4:
      var value = new packsproto_packs_pb.PackId;
      reader.readMessage(value,packsproto_packs_pb.PackId.deserializeBinaryFromReader);
      msg.setRemovePack(value);
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
proto.solutions.SolutionChangeRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.SolutionChangeRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.SolutionChangeRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.SolutionChangeRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSolution();
  if (f != null) {
    writer.writeMessage(
      5,
      f,
      proto.solutions.SolutionData.serializeBinaryToWriter
    );
  }
  f = message.getAddPack();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      packsproto_packs_pb.PackId.serializeBinaryToWriter
    );
  }
  f = message.getRemovePack();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      packsproto_packs_pb.PackId.serializeBinaryToWriter
    );
  }
};


/**
 * optional SolutionData solution = 5;
 * @return {?proto.solutions.SolutionData}
 */
proto.solutions.SolutionChangeRequest.prototype.getSolution = function() {
  return /** @type{?proto.solutions.SolutionData} */ (
    jspb.Message.getWrapperField(this, proto.solutions.SolutionData, 5));
};


/**
 * @param {?proto.solutions.SolutionData|undefined} value
 * @return {!proto.solutions.SolutionChangeRequest} returns this
*/
proto.solutions.SolutionChangeRequest.prototype.setSolution = function(value) {
  return jspb.Message.setWrapperField(this, 5, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.SolutionChangeRequest} returns this
 */
proto.solutions.SolutionChangeRequest.prototype.clearSolution = function() {
  return this.setSolution(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.SolutionChangeRequest.prototype.hasSolution = function() {
  return jspb.Message.getField(this, 5) != null;
};


/**
 * optional packs.PackId add_pack = 3;
 * @return {?proto.packs.PackId}
 */
proto.solutions.SolutionChangeRequest.prototype.getAddPack = function() {
  return /** @type{?proto.packs.PackId} */ (
    jspb.Message.getWrapperField(this, packsproto_packs_pb.PackId, 3));
};


/**
 * @param {?proto.packs.PackId|undefined} value
 * @return {!proto.solutions.SolutionChangeRequest} returns this
*/
proto.solutions.SolutionChangeRequest.prototype.setAddPack = function(value) {
  return jspb.Message.setOneofWrapperField(this, 3, proto.solutions.SolutionChangeRequest.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.SolutionChangeRequest} returns this
 */
proto.solutions.SolutionChangeRequest.prototype.clearAddPack = function() {
  return this.setAddPack(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.SolutionChangeRequest.prototype.hasAddPack = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional packs.PackId remove_pack = 4;
 * @return {?proto.packs.PackId}
 */
proto.solutions.SolutionChangeRequest.prototype.getRemovePack = function() {
  return /** @type{?proto.packs.PackId} */ (
    jspb.Message.getWrapperField(this, packsproto_packs_pb.PackId, 4));
};


/**
 * @param {?proto.packs.PackId|undefined} value
 * @return {!proto.solutions.SolutionChangeRequest} returns this
*/
proto.solutions.SolutionChangeRequest.prototype.setRemovePack = function(value) {
  return jspb.Message.setOneofWrapperField(this, 4, proto.solutions.SolutionChangeRequest.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.SolutionChangeRequest} returns this
 */
proto.solutions.SolutionChangeRequest.prototype.clearRemovePack = function() {
  return this.setRemovePack(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.SolutionChangeRequest.prototype.hasRemovePack = function() {
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.Device.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.Device.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.Device} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.Device.toObject = function(includeInstance, msg) {
  var f, obj = {
    name: jspb.Message.getFieldWithDefault(msg, 1, ""),
    vendor: jspb.Message.getFieldWithDefault(msg, 2, ""),
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
 * @return {!proto.solutions.Device}
 */
proto.solutions.Device.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.Device;
  return proto.solutions.Device.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.Device} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.Device}
 */
proto.solutions.Device.deserializeBinaryFromReader = function(msg, reader) {
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
proto.solutions.Device.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.Device.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.Device} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.Device.serializeBinaryToWriter = function(message, writer) {
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
  f = message.getProcessor();
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
proto.solutions.Device.prototype.getName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.Device} returns this
 */
proto.solutions.Device.prototype.setName = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string vendor = 2;
 * @return {string}
 */
proto.solutions.Device.prototype.getVendor = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.Device} returns this
 */
proto.solutions.Device.prototype.setVendor = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string processor = 3;
 * @return {string}
 */
proto.solutions.Device.prototype.getProcessor = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.Device} returns this
 */
proto.solutions.Device.prototype.setProcessor = function(value) {
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.DeviceAndToolchainInfo.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.DeviceAndToolchainInfo.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.DeviceAndToolchainInfo} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.DeviceAndToolchainInfo.toObject = function(includeInstance, msg) {
  var f, obj = {
    buildContext: (f = msg.getBuildContext()) && proto.solutions.BuildContext.toObject(includeInstance, f),
    targetOptions: (f = msg.getTargetOptions()) && packsproto_packs_pb.TargetOptions.toObject(includeInstance, f),
    toolchainOptions: (f = msg.getToolchainOptions()) && packsproto_packs_pb.ToolchainOptions.toObject(includeInstance, f)
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
 * @return {!proto.solutions.DeviceAndToolchainInfo}
 */
proto.solutions.DeviceAndToolchainInfo.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.DeviceAndToolchainInfo;
  return proto.solutions.DeviceAndToolchainInfo.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.DeviceAndToolchainInfo} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.DeviceAndToolchainInfo}
 */
proto.solutions.DeviceAndToolchainInfo.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.BuildContext;
      reader.readMessage(value,proto.solutions.BuildContext.deserializeBinaryFromReader);
      msg.setBuildContext(value);
      break;
    case 2:
      var value = new packsproto_packs_pb.TargetOptions;
      reader.readMessage(value,packsproto_packs_pb.TargetOptions.deserializeBinaryFromReader);
      msg.setTargetOptions(value);
      break;
    case 3:
      var value = new packsproto_packs_pb.ToolchainOptions;
      reader.readMessage(value,packsproto_packs_pb.ToolchainOptions.deserializeBinaryFromReader);
      msg.setToolchainOptions(value);
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
proto.solutions.DeviceAndToolchainInfo.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.DeviceAndToolchainInfo.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.DeviceAndToolchainInfo} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.DeviceAndToolchainInfo.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBuildContext();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.BuildContext.serializeBinaryToWriter
    );
  }
  f = message.getTargetOptions();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      packsproto_packs_pb.TargetOptions.serializeBinaryToWriter
    );
  }
  f = message.getToolchainOptions();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      packsproto_packs_pb.ToolchainOptions.serializeBinaryToWriter
    );
  }
};


/**
 * optional BuildContext build_context = 1;
 * @return {?proto.solutions.BuildContext}
 */
proto.solutions.DeviceAndToolchainInfo.prototype.getBuildContext = function() {
  return /** @type{?proto.solutions.BuildContext} */ (
    jspb.Message.getWrapperField(this, proto.solutions.BuildContext, 1));
};


/**
 * @param {?proto.solutions.BuildContext|undefined} value
 * @return {!proto.solutions.DeviceAndToolchainInfo} returns this
*/
proto.solutions.DeviceAndToolchainInfo.prototype.setBuildContext = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.DeviceAndToolchainInfo} returns this
 */
proto.solutions.DeviceAndToolchainInfo.prototype.clearBuildContext = function() {
  return this.setBuildContext(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.DeviceAndToolchainInfo.prototype.hasBuildContext = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional packs.TargetOptions target_options = 2;
 * @return {?proto.packs.TargetOptions}
 */
proto.solutions.DeviceAndToolchainInfo.prototype.getTargetOptions = function() {
  return /** @type{?proto.packs.TargetOptions} */ (
    jspb.Message.getWrapperField(this, packsproto_packs_pb.TargetOptions, 2));
};


/**
 * @param {?proto.packs.TargetOptions|undefined} value
 * @return {!proto.solutions.DeviceAndToolchainInfo} returns this
*/
proto.solutions.DeviceAndToolchainInfo.prototype.setTargetOptions = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.DeviceAndToolchainInfo} returns this
 */
proto.solutions.DeviceAndToolchainInfo.prototype.clearTargetOptions = function() {
  return this.setTargetOptions(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.DeviceAndToolchainInfo.prototype.hasTargetOptions = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional packs.ToolchainOptions toolchain_options = 3;
 * @return {?proto.packs.ToolchainOptions}
 */
proto.solutions.DeviceAndToolchainInfo.prototype.getToolchainOptions = function() {
  return /** @type{?proto.packs.ToolchainOptions} */ (
    jspb.Message.getWrapperField(this, packsproto_packs_pb.ToolchainOptions, 3));
};


/**
 * @param {?proto.packs.ToolchainOptions|undefined} value
 * @return {!proto.solutions.DeviceAndToolchainInfo} returns this
*/
proto.solutions.DeviceAndToolchainInfo.prototype.setToolchainOptions = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.DeviceAndToolchainInfo} returns this
 */
proto.solutions.DeviceAndToolchainInfo.prototype.clearToolchainOptions = function() {
  return this.setToolchainOptions(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.DeviceAndToolchainInfo.prototype.hasToolchainOptions = function() {
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.ProcessorInfo.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.ProcessorInfo.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.ProcessorInfo} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ProcessorInfo.toObject = function(includeInstance, msg) {
  var f, obj = {
    device: (f = msg.getDevice()) && proto.solutions.Device.toObject(includeInstance, f),
    processor: (f = msg.getProcessor()) && packsproto_packs_pb.Processor.toObject(includeInstance, f)
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
 * @return {!proto.solutions.ProcessorInfo}
 */
proto.solutions.ProcessorInfo.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.ProcessorInfo;
  return proto.solutions.ProcessorInfo.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.ProcessorInfo} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.ProcessorInfo}
 */
proto.solutions.ProcessorInfo.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.Device;
      reader.readMessage(value,proto.solutions.Device.deserializeBinaryFromReader);
      msg.setDevice(value);
      break;
    case 2:
      var value = new packsproto_packs_pb.Processor;
      reader.readMessage(value,packsproto_packs_pb.Processor.deserializeBinaryFromReader);
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
proto.solutions.ProcessorInfo.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.ProcessorInfo.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.ProcessorInfo} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ProcessorInfo.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getDevice();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.Device.serializeBinaryToWriter
    );
  }
  f = message.getProcessor();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      packsproto_packs_pb.Processor.serializeBinaryToWriter
    );
  }
};


/**
 * optional Device device = 1;
 * @return {?proto.solutions.Device}
 */
proto.solutions.ProcessorInfo.prototype.getDevice = function() {
  return /** @type{?proto.solutions.Device} */ (
    jspb.Message.getWrapperField(this, proto.solutions.Device, 1));
};


/**
 * @param {?proto.solutions.Device|undefined} value
 * @return {!proto.solutions.ProcessorInfo} returns this
*/
proto.solutions.ProcessorInfo.prototype.setDevice = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ProcessorInfo} returns this
 */
proto.solutions.ProcessorInfo.prototype.clearDevice = function() {
  return this.setDevice(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ProcessorInfo.prototype.hasDevice = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional packs.Processor processor = 2;
 * @return {?proto.packs.Processor}
 */
proto.solutions.ProcessorInfo.prototype.getProcessor = function() {
  return /** @type{?proto.packs.Processor} */ (
    jspb.Message.getWrapperField(this, packsproto_packs_pb.Processor, 2));
};


/**
 * @param {?proto.packs.Processor|undefined} value
 * @return {!proto.solutions.ProcessorInfo} returns this
*/
proto.solutions.ProcessorInfo.prototype.setProcessor = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ProcessorInfo} returns this
 */
proto.solutions.ProcessorInfo.prototype.clearProcessor = function() {
  return this.setProcessor(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ProcessorInfo.prototype.hasProcessor = function() {
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.TargetTypeInSolution.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.TargetTypeInSolution.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.TargetTypeInSolution} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.TargetTypeInSolution.toObject = function(includeInstance, msg) {
  var f, obj = {
    solution: (f = msg.getSolution()) && proto.solutions.SolutionData.toObject(includeInstance, f),
    targetTypeId: (f = msg.getTargetTypeId()) && proto.solutions.TargetTypeId.toObject(includeInstance, f)
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
 * @return {!proto.solutions.TargetTypeInSolution}
 */
proto.solutions.TargetTypeInSolution.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.TargetTypeInSolution;
  return proto.solutions.TargetTypeInSolution.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.TargetTypeInSolution} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.TargetTypeInSolution}
 */
proto.solutions.TargetTypeInSolution.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.SolutionData;
      reader.readMessage(value,proto.solutions.SolutionData.deserializeBinaryFromReader);
      msg.setSolution(value);
      break;
    case 2:
      var value = new proto.solutions.TargetTypeId;
      reader.readMessage(value,proto.solutions.TargetTypeId.deserializeBinaryFromReader);
      msg.setTargetTypeId(value);
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
proto.solutions.TargetTypeInSolution.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.TargetTypeInSolution.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.TargetTypeInSolution} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.TargetTypeInSolution.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSolution();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.SolutionData.serializeBinaryToWriter
    );
  }
  f = message.getTargetTypeId();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.solutions.TargetTypeId.serializeBinaryToWriter
    );
  }
};


/**
 * optional SolutionData solution = 1;
 * @return {?proto.solutions.SolutionData}
 */
proto.solutions.TargetTypeInSolution.prototype.getSolution = function() {
  return /** @type{?proto.solutions.SolutionData} */ (
    jspb.Message.getWrapperField(this, proto.solutions.SolutionData, 1));
};


/**
 * @param {?proto.solutions.SolutionData|undefined} value
 * @return {!proto.solutions.TargetTypeInSolution} returns this
*/
proto.solutions.TargetTypeInSolution.prototype.setSolution = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.TargetTypeInSolution} returns this
 */
proto.solutions.TargetTypeInSolution.prototype.clearSolution = function() {
  return this.setSolution(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.TargetTypeInSolution.prototype.hasSolution = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional TargetTypeId target_type_id = 2;
 * @return {?proto.solutions.TargetTypeId}
 */
proto.solutions.TargetTypeInSolution.prototype.getTargetTypeId = function() {
  return /** @type{?proto.solutions.TargetTypeId} */ (
    jspb.Message.getWrapperField(this, proto.solutions.TargetTypeId, 2));
};


/**
 * @param {?proto.solutions.TargetTypeId|undefined} value
 * @return {!proto.solutions.TargetTypeInSolution} returns this
*/
proto.solutions.TargetTypeInSolution.prototype.setTargetTypeId = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.TargetTypeInSolution} returns this
 */
proto.solutions.TargetTypeInSolution.prototype.clearTargetTypeId = function() {
  return this.setTargetTypeId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.TargetTypeInSolution.prototype.hasTargetTypeId = function() {
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.TargetTypeId.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.TargetTypeId.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.TargetTypeId} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.TargetTypeId.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: jspb.Message.getFieldWithDefault(msg, 1, "")
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
 * @return {!proto.solutions.TargetTypeId}
 */
proto.solutions.TargetTypeId.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.TargetTypeId;
  return proto.solutions.TargetTypeId.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.TargetTypeId} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.TargetTypeId}
 */
proto.solutions.TargetTypeId.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
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
proto.solutions.TargetTypeId.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.TargetTypeId.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.TargetTypeId} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.TargetTypeId.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
};


/**
 * optional string id = 1;
 * @return {string}
 */
proto.solutions.TargetTypeId.prototype.getId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.TargetTypeId} returns this
 */
proto.solutions.TargetTypeId.prototype.setId = function(value) {
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.TargetTypeInfo.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.TargetTypeInfo.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.TargetTypeInfo} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.TargetTypeInfo.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: (f = msg.getId()) && proto.solutions.TargetTypeId.toObject(includeInstance, f),
    type: jspb.Message.getFieldWithDefault(msg, 2, ""),
    boardId: (f = msg.getBoardId()) && packsproto_packs_pb.BoardId.toObject(includeInstance, f),
    compiler: jspb.Message.getFieldWithDefault(msg, 4, ""),
    device: (f = msg.getDevice()) && proto.solutions.Device.toObject(includeInstance, f)
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
 * @return {!proto.solutions.TargetTypeInfo}
 */
proto.solutions.TargetTypeInfo.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.TargetTypeInfo;
  return proto.solutions.TargetTypeInfo.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.TargetTypeInfo} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.TargetTypeInfo}
 */
proto.solutions.TargetTypeInfo.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.TargetTypeId;
      reader.readMessage(value,proto.solutions.TargetTypeId.deserializeBinaryFromReader);
      msg.setId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setType(value);
      break;
    case 3:
      var value = new packsproto_packs_pb.BoardId;
      reader.readMessage(value,packsproto_packs_pb.BoardId.deserializeBinaryFromReader);
      msg.setBoardId(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setCompiler(value);
      break;
    case 5:
      var value = new proto.solutions.Device;
      reader.readMessage(value,proto.solutions.Device.deserializeBinaryFromReader);
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
proto.solutions.TargetTypeInfo.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.TargetTypeInfo.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.TargetTypeInfo} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.TargetTypeInfo.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.TargetTypeId.serializeBinaryToWriter
    );
  }
  f = message.getType();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getBoardId();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      packsproto_packs_pb.BoardId.serializeBinaryToWriter
    );
  }
  f = message.getCompiler();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getDevice();
  if (f != null) {
    writer.writeMessage(
      5,
      f,
      proto.solutions.Device.serializeBinaryToWriter
    );
  }
};


/**
 * optional TargetTypeId id = 1;
 * @return {?proto.solutions.TargetTypeId}
 */
proto.solutions.TargetTypeInfo.prototype.getId = function() {
  return /** @type{?proto.solutions.TargetTypeId} */ (
    jspb.Message.getWrapperField(this, proto.solutions.TargetTypeId, 1));
};


/**
 * @param {?proto.solutions.TargetTypeId|undefined} value
 * @return {!proto.solutions.TargetTypeInfo} returns this
*/
proto.solutions.TargetTypeInfo.prototype.setId = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.TargetTypeInfo} returns this
 */
proto.solutions.TargetTypeInfo.prototype.clearId = function() {
  return this.setId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.TargetTypeInfo.prototype.hasId = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional string type = 2;
 * @return {string}
 */
proto.solutions.TargetTypeInfo.prototype.getType = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.TargetTypeInfo} returns this
 */
proto.solutions.TargetTypeInfo.prototype.setType = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional packs.BoardId board_id = 3;
 * @return {?proto.packs.BoardId}
 */
proto.solutions.TargetTypeInfo.prototype.getBoardId = function() {
  return /** @type{?proto.packs.BoardId} */ (
    jspb.Message.getWrapperField(this, packsproto_packs_pb.BoardId, 3));
};


/**
 * @param {?proto.packs.BoardId|undefined} value
 * @return {!proto.solutions.TargetTypeInfo} returns this
*/
proto.solutions.TargetTypeInfo.prototype.setBoardId = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.TargetTypeInfo} returns this
 */
proto.solutions.TargetTypeInfo.prototype.clearBoardId = function() {
  return this.setBoardId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.TargetTypeInfo.prototype.hasBoardId = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional string compiler = 4;
 * @return {string}
 */
proto.solutions.TargetTypeInfo.prototype.getCompiler = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.TargetTypeInfo} returns this
 */
proto.solutions.TargetTypeInfo.prototype.setCompiler = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional Device device = 5;
 * @return {?proto.solutions.Device}
 */
proto.solutions.TargetTypeInfo.prototype.getDevice = function() {
  return /** @type{?proto.solutions.Device} */ (
    jspb.Message.getWrapperField(this, proto.solutions.Device, 5));
};


/**
 * @param {?proto.solutions.Device|undefined} value
 * @return {!proto.solutions.TargetTypeInfo} returns this
*/
proto.solutions.TargetTypeInfo.prototype.setDevice = function(value) {
  return jspb.Message.setWrapperField(this, 5, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.TargetTypeInfo} returns this
 */
proto.solutions.TargetTypeInfo.prototype.clearDevice = function() {
  return this.setDevice(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.TargetTypeInfo.prototype.hasDevice = function() {
  return jspb.Message.getField(this, 5) != null;
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.BuildTypeInSolution.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.BuildTypeInSolution.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.BuildTypeInSolution} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.BuildTypeInSolution.toObject = function(includeInstance, msg) {
  var f, obj = {
    solution: (f = msg.getSolution()) && proto.solutions.SolutionData.toObject(includeInstance, f),
    buildTypeId: (f = msg.getBuildTypeId()) && proto.solutions.BuildTypeId.toObject(includeInstance, f)
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
 * @return {!proto.solutions.BuildTypeInSolution}
 */
proto.solutions.BuildTypeInSolution.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.BuildTypeInSolution;
  return proto.solutions.BuildTypeInSolution.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.BuildTypeInSolution} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.BuildTypeInSolution}
 */
proto.solutions.BuildTypeInSolution.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.SolutionData;
      reader.readMessage(value,proto.solutions.SolutionData.deserializeBinaryFromReader);
      msg.setSolution(value);
      break;
    case 2:
      var value = new proto.solutions.BuildTypeId;
      reader.readMessage(value,proto.solutions.BuildTypeId.deserializeBinaryFromReader);
      msg.setBuildTypeId(value);
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
proto.solutions.BuildTypeInSolution.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.BuildTypeInSolution.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.BuildTypeInSolution} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.BuildTypeInSolution.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSolution();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.SolutionData.serializeBinaryToWriter
    );
  }
  f = message.getBuildTypeId();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.solutions.BuildTypeId.serializeBinaryToWriter
    );
  }
};


/**
 * optional SolutionData solution = 1;
 * @return {?proto.solutions.SolutionData}
 */
proto.solutions.BuildTypeInSolution.prototype.getSolution = function() {
  return /** @type{?proto.solutions.SolutionData} */ (
    jspb.Message.getWrapperField(this, proto.solutions.SolutionData, 1));
};


/**
 * @param {?proto.solutions.SolutionData|undefined} value
 * @return {!proto.solutions.BuildTypeInSolution} returns this
*/
proto.solutions.BuildTypeInSolution.prototype.setSolution = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.BuildTypeInSolution} returns this
 */
proto.solutions.BuildTypeInSolution.prototype.clearSolution = function() {
  return this.setSolution(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.BuildTypeInSolution.prototype.hasSolution = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional BuildTypeId build_type_id = 2;
 * @return {?proto.solutions.BuildTypeId}
 */
proto.solutions.BuildTypeInSolution.prototype.getBuildTypeId = function() {
  return /** @type{?proto.solutions.BuildTypeId} */ (
    jspb.Message.getWrapperField(this, proto.solutions.BuildTypeId, 2));
};


/**
 * @param {?proto.solutions.BuildTypeId|undefined} value
 * @return {!proto.solutions.BuildTypeInSolution} returns this
*/
proto.solutions.BuildTypeInSolution.prototype.setBuildTypeId = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.BuildTypeInSolution} returns this
 */
proto.solutions.BuildTypeInSolution.prototype.clearBuildTypeId = function() {
  return this.setBuildTypeId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.BuildTypeInSolution.prototype.hasBuildTypeId = function() {
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.BuildTypeId.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.BuildTypeId.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.BuildTypeId} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.BuildTypeId.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: jspb.Message.getFieldWithDefault(msg, 1, "")
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
 * @return {!proto.solutions.BuildTypeId}
 */
proto.solutions.BuildTypeId.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.BuildTypeId;
  return proto.solutions.BuildTypeId.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.BuildTypeId} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.BuildTypeId}
 */
proto.solutions.BuildTypeId.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
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
proto.solutions.BuildTypeId.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.BuildTypeId.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.BuildTypeId} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.BuildTypeId.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
};


/**
 * optional string id = 1;
 * @return {string}
 */
proto.solutions.BuildTypeId.prototype.getId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.BuildTypeId} returns this
 */
proto.solutions.BuildTypeId.prototype.setId = function(value) {
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.BuildTypeInfo.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.BuildTypeInfo.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.BuildTypeInfo} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.BuildTypeInfo.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: (f = msg.getId()) && proto.solutions.BuildTypeId.toObject(includeInstance, f),
    type: jspb.Message.getFieldWithDefault(msg, 2, ""),
    compiler: jspb.Message.getFieldWithDefault(msg, 3, ""),
    debug: jspb.Message.getBooleanFieldWithDefault(msg, 4, false)
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
 * @return {!proto.solutions.BuildTypeInfo}
 */
proto.solutions.BuildTypeInfo.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.BuildTypeInfo;
  return proto.solutions.BuildTypeInfo.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.BuildTypeInfo} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.BuildTypeInfo}
 */
proto.solutions.BuildTypeInfo.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.BuildTypeId;
      reader.readMessage(value,proto.solutions.BuildTypeId.deserializeBinaryFromReader);
      msg.setId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setType(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setCompiler(value);
      break;
    case 4:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setDebug(value);
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
proto.solutions.BuildTypeInfo.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.BuildTypeInfo.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.BuildTypeInfo} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.BuildTypeInfo.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.BuildTypeId.serializeBinaryToWriter
    );
  }
  f = message.getType();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getCompiler();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getDebug();
  if (f) {
    writer.writeBool(
      4,
      f
    );
  }
};


/**
 * optional BuildTypeId id = 1;
 * @return {?proto.solutions.BuildTypeId}
 */
proto.solutions.BuildTypeInfo.prototype.getId = function() {
  return /** @type{?proto.solutions.BuildTypeId} */ (
    jspb.Message.getWrapperField(this, proto.solutions.BuildTypeId, 1));
};


/**
 * @param {?proto.solutions.BuildTypeId|undefined} value
 * @return {!proto.solutions.BuildTypeInfo} returns this
*/
proto.solutions.BuildTypeInfo.prototype.setId = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.BuildTypeInfo} returns this
 */
proto.solutions.BuildTypeInfo.prototype.clearId = function() {
  return this.setId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.BuildTypeInfo.prototype.hasId = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional string type = 2;
 * @return {string}
 */
proto.solutions.BuildTypeInfo.prototype.getType = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.BuildTypeInfo} returns this
 */
proto.solutions.BuildTypeInfo.prototype.setType = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string compiler = 3;
 * @return {string}
 */
proto.solutions.BuildTypeInfo.prototype.getCompiler = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.BuildTypeInfo} returns this
 */
proto.solutions.BuildTypeInfo.prototype.setCompiler = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional bool debug = 4;
 * @return {boolean}
 */
proto.solutions.BuildTypeInfo.prototype.getDebug = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 4, false));
};


/**
 * @param {boolean} value
 * @return {!proto.solutions.BuildTypeInfo} returns this
 */
proto.solutions.BuildTypeInfo.prototype.setDebug = function(value) {
  return jspb.Message.setProto3BooleanField(this, 4, value);
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.BuildContext.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.BuildContext.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.BuildContext} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.BuildContext.toObject = function(includeInstance, msg) {
  var f, obj = {
    targetTypeId: (f = msg.getTargetTypeId()) && proto.solutions.TargetTypeId.toObject(includeInstance, f),
    buildTypeId: (f = msg.getBuildTypeId()) && proto.solutions.BuildTypeId.toObject(includeInstance, f)
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
 * @return {!proto.solutions.BuildContext}
 */
proto.solutions.BuildContext.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.BuildContext;
  return proto.solutions.BuildContext.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.BuildContext} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.BuildContext}
 */
proto.solutions.BuildContext.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.TargetTypeId;
      reader.readMessage(value,proto.solutions.TargetTypeId.deserializeBinaryFromReader);
      msg.setTargetTypeId(value);
      break;
    case 2:
      var value = new proto.solutions.BuildTypeId;
      reader.readMessage(value,proto.solutions.BuildTypeId.deserializeBinaryFromReader);
      msg.setBuildTypeId(value);
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
proto.solutions.BuildContext.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.BuildContext.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.BuildContext} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.BuildContext.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTargetTypeId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.TargetTypeId.serializeBinaryToWriter
    );
  }
  f = message.getBuildTypeId();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.solutions.BuildTypeId.serializeBinaryToWriter
    );
  }
};


/**
 * optional TargetTypeId target_type_id = 1;
 * @return {?proto.solutions.TargetTypeId}
 */
proto.solutions.BuildContext.prototype.getTargetTypeId = function() {
  return /** @type{?proto.solutions.TargetTypeId} */ (
    jspb.Message.getWrapperField(this, proto.solutions.TargetTypeId, 1));
};


/**
 * @param {?proto.solutions.TargetTypeId|undefined} value
 * @return {!proto.solutions.BuildContext} returns this
*/
proto.solutions.BuildContext.prototype.setTargetTypeId = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.BuildContext} returns this
 */
proto.solutions.BuildContext.prototype.clearTargetTypeId = function() {
  return this.setTargetTypeId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.BuildContext.prototype.hasTargetTypeId = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional BuildTypeId build_type_id = 2;
 * @return {?proto.solutions.BuildTypeId}
 */
proto.solutions.BuildContext.prototype.getBuildTypeId = function() {
  return /** @type{?proto.solutions.BuildTypeId} */ (
    jspb.Message.getWrapperField(this, proto.solutions.BuildTypeId, 2));
};


/**
 * @param {?proto.solutions.BuildTypeId|undefined} value
 * @return {!proto.solutions.BuildContext} returns this
*/
proto.solutions.BuildContext.prototype.setBuildTypeId = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.BuildContext} returns this
 */
proto.solutions.BuildContext.prototype.clearBuildTypeId = function() {
  return this.setBuildTypeId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.BuildContext.prototype.hasBuildTypeId = function() {
  return jspb.Message.getField(this, 2) != null;
};



/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.solutions.ProjectChangeRequest.oneofGroups_ = [[2,3,4]];

/**
 * @enum {number}
 */
proto.solutions.ProjectChangeRequest.ChangeCase = {
  CHANGE_NOT_SET: 0,
  ADD_COMPONENT: 2,
  REMOVE_COMPONENT: 3,
  ADD_PACK: 4
};

/**
 * @return {proto.solutions.ProjectChangeRequest.ChangeCase}
 */
proto.solutions.ProjectChangeRequest.prototype.getChangeCase = function() {
  return /** @type {proto.solutions.ProjectChangeRequest.ChangeCase} */(jspb.Message.computeOneofCase(this, proto.solutions.ProjectChangeRequest.oneofGroups_[0]));
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.ProjectChangeRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.ProjectChangeRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.ProjectChangeRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ProjectChangeRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    solution: (f = msg.getSolution()) && proto.solutions.SolutionData.toObject(includeInstance, f),
    projectId: (f = msg.getProjectId()) && proto.solutions.ProjectId.toObject(includeInstance, f),
    addComponent: (f = msg.getAddComponent()) && proto.solutions.ComponentSelectionRequest.toObject(includeInstance, f),
    removeComponent: (f = msg.getRemoveComponent()) && proto.solutions.ComponentSelectionRequest.toObject(includeInstance, f),
    addPack: (f = msg.getAddPack()) && packsproto_packs_pb.PackId.toObject(includeInstance, f)
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
 * @return {!proto.solutions.ProjectChangeRequest}
 */
proto.solutions.ProjectChangeRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.ProjectChangeRequest;
  return proto.solutions.ProjectChangeRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.ProjectChangeRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.ProjectChangeRequest}
 */
proto.solutions.ProjectChangeRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 5:
      var value = new proto.solutions.SolutionData;
      reader.readMessage(value,proto.solutions.SolutionData.deserializeBinaryFromReader);
      msg.setSolution(value);
      break;
    case 1:
      var value = new proto.solutions.ProjectId;
      reader.readMessage(value,proto.solutions.ProjectId.deserializeBinaryFromReader);
      msg.setProjectId(value);
      break;
    case 2:
      var value = new proto.solutions.ComponentSelectionRequest;
      reader.readMessage(value,proto.solutions.ComponentSelectionRequest.deserializeBinaryFromReader);
      msg.setAddComponent(value);
      break;
    case 3:
      var value = new proto.solutions.ComponentSelectionRequest;
      reader.readMessage(value,proto.solutions.ComponentSelectionRequest.deserializeBinaryFromReader);
      msg.setRemoveComponent(value);
      break;
    case 4:
      var value = new packsproto_packs_pb.PackId;
      reader.readMessage(value,packsproto_packs_pb.PackId.deserializeBinaryFromReader);
      msg.setAddPack(value);
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
proto.solutions.ProjectChangeRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.ProjectChangeRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.ProjectChangeRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ProjectChangeRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSolution();
  if (f != null) {
    writer.writeMessage(
      5,
      f,
      proto.solutions.SolutionData.serializeBinaryToWriter
    );
  }
  f = message.getProjectId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.ProjectId.serializeBinaryToWriter
    );
  }
  f = message.getAddComponent();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.solutions.ComponentSelectionRequest.serializeBinaryToWriter
    );
  }
  f = message.getRemoveComponent();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.solutions.ComponentSelectionRequest.serializeBinaryToWriter
    );
  }
  f = message.getAddPack();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      packsproto_packs_pb.PackId.serializeBinaryToWriter
    );
  }
};


/**
 * optional SolutionData solution = 5;
 * @return {?proto.solutions.SolutionData}
 */
proto.solutions.ProjectChangeRequest.prototype.getSolution = function() {
  return /** @type{?proto.solutions.SolutionData} */ (
    jspb.Message.getWrapperField(this, proto.solutions.SolutionData, 5));
};


/**
 * @param {?proto.solutions.SolutionData|undefined} value
 * @return {!proto.solutions.ProjectChangeRequest} returns this
*/
proto.solutions.ProjectChangeRequest.prototype.setSolution = function(value) {
  return jspb.Message.setWrapperField(this, 5, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ProjectChangeRequest} returns this
 */
proto.solutions.ProjectChangeRequest.prototype.clearSolution = function() {
  return this.setSolution(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ProjectChangeRequest.prototype.hasSolution = function() {
  return jspb.Message.getField(this, 5) != null;
};


/**
 * optional ProjectId project_id = 1;
 * @return {?proto.solutions.ProjectId}
 */
proto.solutions.ProjectChangeRequest.prototype.getProjectId = function() {
  return /** @type{?proto.solutions.ProjectId} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ProjectId, 1));
};


/**
 * @param {?proto.solutions.ProjectId|undefined} value
 * @return {!proto.solutions.ProjectChangeRequest} returns this
*/
proto.solutions.ProjectChangeRequest.prototype.setProjectId = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ProjectChangeRequest} returns this
 */
proto.solutions.ProjectChangeRequest.prototype.clearProjectId = function() {
  return this.setProjectId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ProjectChangeRequest.prototype.hasProjectId = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional ComponentSelectionRequest add_component = 2;
 * @return {?proto.solutions.ComponentSelectionRequest}
 */
proto.solutions.ProjectChangeRequest.prototype.getAddComponent = function() {
  return /** @type{?proto.solutions.ComponentSelectionRequest} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ComponentSelectionRequest, 2));
};


/**
 * @param {?proto.solutions.ComponentSelectionRequest|undefined} value
 * @return {!proto.solutions.ProjectChangeRequest} returns this
*/
proto.solutions.ProjectChangeRequest.prototype.setAddComponent = function(value) {
  return jspb.Message.setOneofWrapperField(this, 2, proto.solutions.ProjectChangeRequest.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ProjectChangeRequest} returns this
 */
proto.solutions.ProjectChangeRequest.prototype.clearAddComponent = function() {
  return this.setAddComponent(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ProjectChangeRequest.prototype.hasAddComponent = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional ComponentSelectionRequest remove_component = 3;
 * @return {?proto.solutions.ComponentSelectionRequest}
 */
proto.solutions.ProjectChangeRequest.prototype.getRemoveComponent = function() {
  return /** @type{?proto.solutions.ComponentSelectionRequest} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ComponentSelectionRequest, 3));
};


/**
 * @param {?proto.solutions.ComponentSelectionRequest|undefined} value
 * @return {!proto.solutions.ProjectChangeRequest} returns this
*/
proto.solutions.ProjectChangeRequest.prototype.setRemoveComponent = function(value) {
  return jspb.Message.setOneofWrapperField(this, 3, proto.solutions.ProjectChangeRequest.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ProjectChangeRequest} returns this
 */
proto.solutions.ProjectChangeRequest.prototype.clearRemoveComponent = function() {
  return this.setRemoveComponent(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ProjectChangeRequest.prototype.hasRemoveComponent = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional packs.PackId add_pack = 4;
 * @return {?proto.packs.PackId}
 */
proto.solutions.ProjectChangeRequest.prototype.getAddPack = function() {
  return /** @type{?proto.packs.PackId} */ (
    jspb.Message.getWrapperField(this, packsproto_packs_pb.PackId, 4));
};


/**
 * @param {?proto.packs.PackId|undefined} value
 * @return {!proto.solutions.ProjectChangeRequest} returns this
*/
proto.solutions.ProjectChangeRequest.prototype.setAddPack = function(value) {
  return jspb.Message.setOneofWrapperField(this, 4, proto.solutions.ProjectChangeRequest.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ProjectChangeRequest} returns this
 */
proto.solutions.ProjectChangeRequest.prototype.clearAddPack = function() {
  return this.setAddPack(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ProjectChangeRequest.prototype.hasAddPack = function() {
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
proto.solutions.ValidationResponse.oneofGroups_ = [[3,4,5]];

/**
 * @enum {number}
 */
proto.solutions.ValidationResponse.ValidationResultCase = {
  VALIDATION_RESULT_NOT_SET: 0,
  COMPONENT_VALIDATION: 3,
  PACK_VALIDATION: 4,
  HARDWARE_VALIDATION: 5
};

/**
 * @return {proto.solutions.ValidationResponse.ValidationResultCase}
 */
proto.solutions.ValidationResponse.prototype.getValidationResultCase = function() {
  return /** @type {proto.solutions.ValidationResponse.ValidationResultCase} */(jspb.Message.computeOneofCase(this, proto.solutions.ValidationResponse.oneofGroups_[0]));
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.ValidationResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.ValidationResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.ValidationResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ValidationResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    componentValidation: (f = msg.getComponentValidation()) && proto.solutions.ComponentValidation.toObject(includeInstance, f),
    packValidation: (f = msg.getPackValidation()) && proto.solutions.PackValidation.toObject(includeInstance, f),
    hardwareValidation: (f = msg.getHardwareValidation()) && proto.solutions.HardwareValidation.toObject(includeInstance, f)
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
 * @return {!proto.solutions.ValidationResponse}
 */
proto.solutions.ValidationResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.ValidationResponse;
  return proto.solutions.ValidationResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.ValidationResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.ValidationResponse}
 */
proto.solutions.ValidationResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 3:
      var value = new proto.solutions.ComponentValidation;
      reader.readMessage(value,proto.solutions.ComponentValidation.deserializeBinaryFromReader);
      msg.setComponentValidation(value);
      break;
    case 4:
      var value = new proto.solutions.PackValidation;
      reader.readMessage(value,proto.solutions.PackValidation.deserializeBinaryFromReader);
      msg.setPackValidation(value);
      break;
    case 5:
      var value = new proto.solutions.HardwareValidation;
      reader.readMessage(value,proto.solutions.HardwareValidation.deserializeBinaryFromReader);
      msg.setHardwareValidation(value);
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
proto.solutions.ValidationResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.ValidationResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.ValidationResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ValidationResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getComponentValidation();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.solutions.ComponentValidation.serializeBinaryToWriter
    );
  }
  f = message.getPackValidation();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.solutions.PackValidation.serializeBinaryToWriter
    );
  }
  f = message.getHardwareValidation();
  if (f != null) {
    writer.writeMessage(
      5,
      f,
      proto.solutions.HardwareValidation.serializeBinaryToWriter
    );
  }
};


/**
 * optional ComponentValidation component_validation = 3;
 * @return {?proto.solutions.ComponentValidation}
 */
proto.solutions.ValidationResponse.prototype.getComponentValidation = function() {
  return /** @type{?proto.solutions.ComponentValidation} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ComponentValidation, 3));
};


/**
 * @param {?proto.solutions.ComponentValidation|undefined} value
 * @return {!proto.solutions.ValidationResponse} returns this
*/
proto.solutions.ValidationResponse.prototype.setComponentValidation = function(value) {
  return jspb.Message.setOneofWrapperField(this, 3, proto.solutions.ValidationResponse.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ValidationResponse} returns this
 */
proto.solutions.ValidationResponse.prototype.clearComponentValidation = function() {
  return this.setComponentValidation(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ValidationResponse.prototype.hasComponentValidation = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional PackValidation pack_validation = 4;
 * @return {?proto.solutions.PackValidation}
 */
proto.solutions.ValidationResponse.prototype.getPackValidation = function() {
  return /** @type{?proto.solutions.PackValidation} */ (
    jspb.Message.getWrapperField(this, proto.solutions.PackValidation, 4));
};


/**
 * @param {?proto.solutions.PackValidation|undefined} value
 * @return {!proto.solutions.ValidationResponse} returns this
*/
proto.solutions.ValidationResponse.prototype.setPackValidation = function(value) {
  return jspb.Message.setOneofWrapperField(this, 4, proto.solutions.ValidationResponse.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ValidationResponse} returns this
 */
proto.solutions.ValidationResponse.prototype.clearPackValidation = function() {
  return this.setPackValidation(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ValidationResponse.prototype.hasPackValidation = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional HardwareValidation hardware_validation = 5;
 * @return {?proto.solutions.HardwareValidation}
 */
proto.solutions.ValidationResponse.prototype.getHardwareValidation = function() {
  return /** @type{?proto.solutions.HardwareValidation} */ (
    jspb.Message.getWrapperField(this, proto.solutions.HardwareValidation, 5));
};


/**
 * @param {?proto.solutions.HardwareValidation|undefined} value
 * @return {!proto.solutions.ValidationResponse} returns this
*/
proto.solutions.ValidationResponse.prototype.setHardwareValidation = function(value) {
  return jspb.Message.setOneofWrapperField(this, 5, proto.solutions.ValidationResponse.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ValidationResponse} returns this
 */
proto.solutions.ValidationResponse.prototype.clearHardwareValidation = function() {
  return this.setHardwareValidation(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ValidationResponse.prototype.hasHardwareValidation = function() {
  return jspb.Message.getField(this, 5) != null;
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.AvailableComponentInfo.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.AvailableComponentInfo.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.AvailableComponentInfo} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.AvailableComponentInfo.toObject = function(includeInstance, msg) {
  var f, obj = {
    buildContext: (f = msg.getBuildContext()) && proto.solutions.BuildContext.toObject(includeInstance, f),
    componentId: (f = msg.getComponentId()) && packsproto_packs_pb.ComponentId.toObject(includeInstance, f),
    doc: (f = msg.getDoc()) && packsproto_packs_pb.Doc.toObject(includeInstance, f),
    defaultVariant: jspb.Message.getBooleanFieldWithDefault(msg, 4, false),
    sourcePackMetadata: (f = msg.getSourcePackMetadata()) && proto.solutions.SourcePackMetadata.toObject(includeInstance, f)
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
 * @return {!proto.solutions.AvailableComponentInfo}
 */
proto.solutions.AvailableComponentInfo.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.AvailableComponentInfo;
  return proto.solutions.AvailableComponentInfo.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.AvailableComponentInfo} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.AvailableComponentInfo}
 */
proto.solutions.AvailableComponentInfo.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.BuildContext;
      reader.readMessage(value,proto.solutions.BuildContext.deserializeBinaryFromReader);
      msg.setBuildContext(value);
      break;
    case 2:
      var value = new packsproto_packs_pb.ComponentId;
      reader.readMessage(value,packsproto_packs_pb.ComponentId.deserializeBinaryFromReader);
      msg.setComponentId(value);
      break;
    case 3:
      var value = new packsproto_packs_pb.Doc;
      reader.readMessage(value,packsproto_packs_pb.Doc.deserializeBinaryFromReader);
      msg.setDoc(value);
      break;
    case 4:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setDefaultVariant(value);
      break;
    case 5:
      var value = new proto.solutions.SourcePackMetadata;
      reader.readMessage(value,proto.solutions.SourcePackMetadata.deserializeBinaryFromReader);
      msg.setSourcePackMetadata(value);
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
proto.solutions.AvailableComponentInfo.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.AvailableComponentInfo.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.AvailableComponentInfo} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.AvailableComponentInfo.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBuildContext();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.BuildContext.serializeBinaryToWriter
    );
  }
  f = message.getComponentId();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      packsproto_packs_pb.ComponentId.serializeBinaryToWriter
    );
  }
  f = message.getDoc();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      packsproto_packs_pb.Doc.serializeBinaryToWriter
    );
  }
  f = message.getDefaultVariant();
  if (f) {
    writer.writeBool(
      4,
      f
    );
  }
  f = message.getSourcePackMetadata();
  if (f != null) {
    writer.writeMessage(
      5,
      f,
      proto.solutions.SourcePackMetadata.serializeBinaryToWriter
    );
  }
};


/**
 * optional BuildContext build_context = 1;
 * @return {?proto.solutions.BuildContext}
 */
proto.solutions.AvailableComponentInfo.prototype.getBuildContext = function() {
  return /** @type{?proto.solutions.BuildContext} */ (
    jspb.Message.getWrapperField(this, proto.solutions.BuildContext, 1));
};


/**
 * @param {?proto.solutions.BuildContext|undefined} value
 * @return {!proto.solutions.AvailableComponentInfo} returns this
*/
proto.solutions.AvailableComponentInfo.prototype.setBuildContext = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.AvailableComponentInfo} returns this
 */
proto.solutions.AvailableComponentInfo.prototype.clearBuildContext = function() {
  return this.setBuildContext(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.AvailableComponentInfo.prototype.hasBuildContext = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional packs.ComponentId component_id = 2;
 * @return {?proto.packs.ComponentId}
 */
proto.solutions.AvailableComponentInfo.prototype.getComponentId = function() {
  return /** @type{?proto.packs.ComponentId} */ (
    jspb.Message.getWrapperField(this, packsproto_packs_pb.ComponentId, 2));
};


/**
 * @param {?proto.packs.ComponentId|undefined} value
 * @return {!proto.solutions.AvailableComponentInfo} returns this
*/
proto.solutions.AvailableComponentInfo.prototype.setComponentId = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.AvailableComponentInfo} returns this
 */
proto.solutions.AvailableComponentInfo.prototype.clearComponentId = function() {
  return this.setComponentId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.AvailableComponentInfo.prototype.hasComponentId = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional packs.Doc doc = 3;
 * @return {?proto.packs.Doc}
 */
proto.solutions.AvailableComponentInfo.prototype.getDoc = function() {
  return /** @type{?proto.packs.Doc} */ (
    jspb.Message.getWrapperField(this, packsproto_packs_pb.Doc, 3));
};


/**
 * @param {?proto.packs.Doc|undefined} value
 * @return {!proto.solutions.AvailableComponentInfo} returns this
*/
proto.solutions.AvailableComponentInfo.prototype.setDoc = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.AvailableComponentInfo} returns this
 */
proto.solutions.AvailableComponentInfo.prototype.clearDoc = function() {
  return this.setDoc(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.AvailableComponentInfo.prototype.hasDoc = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional bool default_variant = 4;
 * @return {boolean}
 */
proto.solutions.AvailableComponentInfo.prototype.getDefaultVariant = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 4, false));
};


/**
 * @param {boolean} value
 * @return {!proto.solutions.AvailableComponentInfo} returns this
 */
proto.solutions.AvailableComponentInfo.prototype.setDefaultVariant = function(value) {
  return jspb.Message.setProto3BooleanField(this, 4, value);
};


/**
 * optional SourcePackMetadata source_pack_metadata = 5;
 * @return {?proto.solutions.SourcePackMetadata}
 */
proto.solutions.AvailableComponentInfo.prototype.getSourcePackMetadata = function() {
  return /** @type{?proto.solutions.SourcePackMetadata} */ (
    jspb.Message.getWrapperField(this, proto.solutions.SourcePackMetadata, 5));
};


/**
 * @param {?proto.solutions.SourcePackMetadata|undefined} value
 * @return {!proto.solutions.AvailableComponentInfo} returns this
*/
proto.solutions.AvailableComponentInfo.prototype.setSourcePackMetadata = function(value) {
  return jspb.Message.setWrapperField(this, 5, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.AvailableComponentInfo} returns this
 */
proto.solutions.AvailableComponentInfo.prototype.clearSourcePackMetadata = function() {
  return this.setSourcePackMetadata(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.AvailableComponentInfo.prototype.hasSourcePackMetadata = function() {
  return jspb.Message.getField(this, 5) != null;
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.SourcePackMetadata.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.SourcePackMetadata.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.SourcePackMetadata} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.SourcePackMetadata.toObject = function(includeInstance, msg) {
  var f, obj = {
    selectedInSolution: jspb.Message.getBooleanFieldWithDefault(msg, 1, false),
    installed: jspb.Message.getBooleanFieldWithDefault(msg, 2, false)
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
 * @return {!proto.solutions.SourcePackMetadata}
 */
proto.solutions.SourcePackMetadata.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.SourcePackMetadata;
  return proto.solutions.SourcePackMetadata.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.SourcePackMetadata} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.SourcePackMetadata}
 */
proto.solutions.SourcePackMetadata.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setSelectedInSolution(value);
      break;
    case 2:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setInstalled(value);
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
proto.solutions.SourcePackMetadata.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.SourcePackMetadata.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.SourcePackMetadata} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.SourcePackMetadata.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSelectedInSolution();
  if (f) {
    writer.writeBool(
      1,
      f
    );
  }
  f = message.getInstalled();
  if (f) {
    writer.writeBool(
      2,
      f
    );
  }
};


/**
 * optional bool selected_in_solution = 1;
 * @return {boolean}
 */
proto.solutions.SourcePackMetadata.prototype.getSelectedInSolution = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 1, false));
};


/**
 * @param {boolean} value
 * @return {!proto.solutions.SourcePackMetadata} returns this
 */
proto.solutions.SourcePackMetadata.prototype.setSelectedInSolution = function(value) {
  return jspb.Message.setProto3BooleanField(this, 1, value);
};


/**
 * optional bool installed = 2;
 * @return {boolean}
 */
proto.solutions.SourcePackMetadata.prototype.getInstalled = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 2, false));
};


/**
 * @param {boolean} value
 * @return {!proto.solutions.SourcePackMetadata} returns this
 */
proto.solutions.SourcePackMetadata.prototype.setInstalled = function(value) {
  return jspb.Message.setProto3BooleanField(this, 2, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.solutions.SelectedComponentInfo.repeatedFields_ = [4,5];



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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.SelectedComponentInfo.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.SelectedComponentInfo.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.SelectedComponentInfo} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.SelectedComponentInfo.toObject = function(includeInstance, msg) {
  var f, obj = {
    buildContext: (f = msg.getBuildContext()) && proto.solutions.BuildContext.toObject(includeInstance, f),
    componentId: (f = msg.getComponentId()) && packsproto_packs_pb.ComponentId.toObject(includeInstance, f),
    reference: (f = msg.getReference()) && proto.solutions.TrackedComponentReference.toObject(includeInstance, f),
    filesList: jspb.Message.toObjectList(msg.getFilesList(),
    packsproto_packs_pb.ComponentFile.toObject, includeInstance),
    configFilesList: jspb.Message.toObjectList(msg.getConfigFilesList(),
    proto.solutions.ConfigFile.toObject, includeInstance)
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
 * @return {!proto.solutions.SelectedComponentInfo}
 */
proto.solutions.SelectedComponentInfo.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.SelectedComponentInfo;
  return proto.solutions.SelectedComponentInfo.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.SelectedComponentInfo} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.SelectedComponentInfo}
 */
proto.solutions.SelectedComponentInfo.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.BuildContext;
      reader.readMessage(value,proto.solutions.BuildContext.deserializeBinaryFromReader);
      msg.setBuildContext(value);
      break;
    case 2:
      var value = new packsproto_packs_pb.ComponentId;
      reader.readMessage(value,packsproto_packs_pb.ComponentId.deserializeBinaryFromReader);
      msg.setComponentId(value);
      break;
    case 3:
      var value = new proto.solutions.TrackedComponentReference;
      reader.readMessage(value,proto.solutions.TrackedComponentReference.deserializeBinaryFromReader);
      msg.setReference(value);
      break;
    case 4:
      var value = new packsproto_packs_pb.ComponentFile;
      reader.readMessage(value,packsproto_packs_pb.ComponentFile.deserializeBinaryFromReader);
      msg.addFiles(value);
      break;
    case 5:
      var value = new proto.solutions.ConfigFile;
      reader.readMessage(value,proto.solutions.ConfigFile.deserializeBinaryFromReader);
      msg.addConfigFiles(value);
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
proto.solutions.SelectedComponentInfo.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.SelectedComponentInfo.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.SelectedComponentInfo} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.SelectedComponentInfo.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBuildContext();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.BuildContext.serializeBinaryToWriter
    );
  }
  f = message.getComponentId();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      packsproto_packs_pb.ComponentId.serializeBinaryToWriter
    );
  }
  f = message.getReference();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.solutions.TrackedComponentReference.serializeBinaryToWriter
    );
  }
  f = message.getFilesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      4,
      f,
      packsproto_packs_pb.ComponentFile.serializeBinaryToWriter
    );
  }
  f = message.getConfigFilesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      5,
      f,
      proto.solutions.ConfigFile.serializeBinaryToWriter
    );
  }
};


/**
 * optional BuildContext build_context = 1;
 * @return {?proto.solutions.BuildContext}
 */
proto.solutions.SelectedComponentInfo.prototype.getBuildContext = function() {
  return /** @type{?proto.solutions.BuildContext} */ (
    jspb.Message.getWrapperField(this, proto.solutions.BuildContext, 1));
};


/**
 * @param {?proto.solutions.BuildContext|undefined} value
 * @return {!proto.solutions.SelectedComponentInfo} returns this
*/
proto.solutions.SelectedComponentInfo.prototype.setBuildContext = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.SelectedComponentInfo} returns this
 */
proto.solutions.SelectedComponentInfo.prototype.clearBuildContext = function() {
  return this.setBuildContext(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.SelectedComponentInfo.prototype.hasBuildContext = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional packs.ComponentId component_id = 2;
 * @return {?proto.packs.ComponentId}
 */
proto.solutions.SelectedComponentInfo.prototype.getComponentId = function() {
  return /** @type{?proto.packs.ComponentId} */ (
    jspb.Message.getWrapperField(this, packsproto_packs_pb.ComponentId, 2));
};


/**
 * @param {?proto.packs.ComponentId|undefined} value
 * @return {!proto.solutions.SelectedComponentInfo} returns this
*/
proto.solutions.SelectedComponentInfo.prototype.setComponentId = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.SelectedComponentInfo} returns this
 */
proto.solutions.SelectedComponentInfo.prototype.clearComponentId = function() {
  return this.setComponentId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.SelectedComponentInfo.prototype.hasComponentId = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional TrackedComponentReference reference = 3;
 * @return {?proto.solutions.TrackedComponentReference}
 */
proto.solutions.SelectedComponentInfo.prototype.getReference = function() {
  return /** @type{?proto.solutions.TrackedComponentReference} */ (
    jspb.Message.getWrapperField(this, proto.solutions.TrackedComponentReference, 3));
};


/**
 * @param {?proto.solutions.TrackedComponentReference|undefined} value
 * @return {!proto.solutions.SelectedComponentInfo} returns this
*/
proto.solutions.SelectedComponentInfo.prototype.setReference = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.SelectedComponentInfo} returns this
 */
proto.solutions.SelectedComponentInfo.prototype.clearReference = function() {
  return this.setReference(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.SelectedComponentInfo.prototype.hasReference = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * repeated packs.ComponentFile files = 4;
 * @return {!Array<!proto.packs.ComponentFile>}
 */
proto.solutions.SelectedComponentInfo.prototype.getFilesList = function() {
  return /** @type{!Array<!proto.packs.ComponentFile>} */ (
    jspb.Message.getRepeatedWrapperField(this, packsproto_packs_pb.ComponentFile, 4));
};


/**
 * @param {!Array<!proto.packs.ComponentFile>} value
 * @return {!proto.solutions.SelectedComponentInfo} returns this
*/
proto.solutions.SelectedComponentInfo.prototype.setFilesList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 4, value);
};


/**
 * @param {!proto.packs.ComponentFile=} opt_value
 * @param {number=} opt_index
 * @return {!proto.packs.ComponentFile}
 */
proto.solutions.SelectedComponentInfo.prototype.addFiles = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 4, opt_value, proto.packs.ComponentFile, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.SelectedComponentInfo} returns this
 */
proto.solutions.SelectedComponentInfo.prototype.clearFilesList = function() {
  return this.setFilesList([]);
};


/**
 * repeated ConfigFile config_files = 5;
 * @return {!Array<!proto.solutions.ConfigFile>}
 */
proto.solutions.SelectedComponentInfo.prototype.getConfigFilesList = function() {
  return /** @type{!Array<!proto.solutions.ConfigFile>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.solutions.ConfigFile, 5));
};


/**
 * @param {!Array<!proto.solutions.ConfigFile>} value
 * @return {!proto.solutions.SelectedComponentInfo} returns this
*/
proto.solutions.SelectedComponentInfo.prototype.setConfigFilesList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 5, value);
};


/**
 * @param {!proto.solutions.ConfigFile=} opt_value
 * @param {number=} opt_index
 * @return {!proto.solutions.ConfigFile}
 */
proto.solutions.SelectedComponentInfo.prototype.addConfigFiles = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 5, opt_value, proto.solutions.ConfigFile, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.SelectedComponentInfo} returns this
 */
proto.solutions.SelectedComponentInfo.prototype.clearConfigFilesList = function() {
  return this.setConfigFilesList([]);
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.ConfigFile.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.ConfigFile.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.ConfigFile} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ConfigFile.toObject = function(includeInstance, msg) {
  var f, obj = {
    source: (f = msg.getSource()) && packsproto_packs_pb.AssetReference.toObject(includeInstance, f),
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
 * @return {!proto.solutions.ConfigFile}
 */
proto.solutions.ConfigFile.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.ConfigFile;
  return proto.solutions.ConfigFile.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.ConfigFile} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.ConfigFile}
 */
proto.solutions.ConfigFile.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new packsproto_packs_pb.AssetReference;
      reader.readMessage(value,packsproto_packs_pb.AssetReference.deserializeBinaryFromReader);
      msg.setSource(value);
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
proto.solutions.ConfigFile.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.ConfigFile.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.ConfigFile} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ConfigFile.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSource();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      packsproto_packs_pb.AssetReference.serializeBinaryToWriter
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
 * optional packs.AssetReference source = 1;
 * @return {?proto.packs.AssetReference}
 */
proto.solutions.ConfigFile.prototype.getSource = function() {
  return /** @type{?proto.packs.AssetReference} */ (
    jspb.Message.getWrapperField(this, packsproto_packs_pb.AssetReference, 1));
};


/**
 * @param {?proto.packs.AssetReference|undefined} value
 * @return {!proto.solutions.ConfigFile} returns this
*/
proto.solutions.ConfigFile.prototype.setSource = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ConfigFile} returns this
 */
proto.solutions.ConfigFile.prototype.clearSource = function() {
  return this.setSource(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ConfigFile.prototype.hasSource = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional string path = 2;
 * @return {string}
 */
proto.solutions.ConfigFile.prototype.getPath = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.ConfigFile} returns this
 */
proto.solutions.ConfigFile.prototype.setPath = function(value) {
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.SelectedLayerInfo.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.SelectedLayerInfo.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.SelectedLayerInfo} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.SelectedLayerInfo.toObject = function(includeInstance, msg) {
  var f, obj = {
    buildContext: (f = msg.getBuildContext()) && proto.solutions.BuildContext.toObject(includeInstance, f),
    layerId: (f = msg.getLayerId()) && proto.solutions.LayerId.toObject(includeInstance, f)
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
 * @return {!proto.solutions.SelectedLayerInfo}
 */
proto.solutions.SelectedLayerInfo.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.SelectedLayerInfo;
  return proto.solutions.SelectedLayerInfo.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.SelectedLayerInfo} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.SelectedLayerInfo}
 */
proto.solutions.SelectedLayerInfo.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.BuildContext;
      reader.readMessage(value,proto.solutions.BuildContext.deserializeBinaryFromReader);
      msg.setBuildContext(value);
      break;
    case 2:
      var value = new proto.solutions.LayerId;
      reader.readMessage(value,proto.solutions.LayerId.deserializeBinaryFromReader);
      msg.setLayerId(value);
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
proto.solutions.SelectedLayerInfo.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.SelectedLayerInfo.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.SelectedLayerInfo} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.SelectedLayerInfo.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBuildContext();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.BuildContext.serializeBinaryToWriter
    );
  }
  f = message.getLayerId();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.solutions.LayerId.serializeBinaryToWriter
    );
  }
};


/**
 * optional BuildContext build_context = 1;
 * @return {?proto.solutions.BuildContext}
 */
proto.solutions.SelectedLayerInfo.prototype.getBuildContext = function() {
  return /** @type{?proto.solutions.BuildContext} */ (
    jspb.Message.getWrapperField(this, proto.solutions.BuildContext, 1));
};


/**
 * @param {?proto.solutions.BuildContext|undefined} value
 * @return {!proto.solutions.SelectedLayerInfo} returns this
*/
proto.solutions.SelectedLayerInfo.prototype.setBuildContext = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.SelectedLayerInfo} returns this
 */
proto.solutions.SelectedLayerInfo.prototype.clearBuildContext = function() {
  return this.setBuildContext(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.SelectedLayerInfo.prototype.hasBuildContext = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional LayerId layer_id = 2;
 * @return {?proto.solutions.LayerId}
 */
proto.solutions.SelectedLayerInfo.prototype.getLayerId = function() {
  return /** @type{?proto.solutions.LayerId} */ (
    jspb.Message.getWrapperField(this, proto.solutions.LayerId, 2));
};


/**
 * @param {?proto.solutions.LayerId|undefined} value
 * @return {!proto.solutions.SelectedLayerInfo} returns this
*/
proto.solutions.SelectedLayerInfo.prototype.setLayerId = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.SelectedLayerInfo} returns this
 */
proto.solutions.SelectedLayerInfo.prototype.clearLayerId = function() {
  return this.setLayerId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.SelectedLayerInfo.prototype.hasLayerId = function() {
  return jspb.Message.getField(this, 2) != null;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.solutions.ComponentSelectionRequest.repeatedFields_ = [1];



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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.ComponentSelectionRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.ComponentSelectionRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.ComponentSelectionRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentSelectionRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    buildContextsList: jspb.Message.toObjectList(msg.getBuildContextsList(),
    proto.solutions.BuildContext.toObject, includeInstance),
    reference: (f = msg.getReference()) && proto.solutions.ComponentReference.toObject(includeInstance, f)
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
 * @return {!proto.solutions.ComponentSelectionRequest}
 */
proto.solutions.ComponentSelectionRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.ComponentSelectionRequest;
  return proto.solutions.ComponentSelectionRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.ComponentSelectionRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.ComponentSelectionRequest}
 */
proto.solutions.ComponentSelectionRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.BuildContext;
      reader.readMessage(value,proto.solutions.BuildContext.deserializeBinaryFromReader);
      msg.addBuildContexts(value);
      break;
    case 2:
      var value = new proto.solutions.ComponentReference;
      reader.readMessage(value,proto.solutions.ComponentReference.deserializeBinaryFromReader);
      msg.setReference(value);
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
proto.solutions.ComponentSelectionRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.ComponentSelectionRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.ComponentSelectionRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentSelectionRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBuildContextsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.solutions.BuildContext.serializeBinaryToWriter
    );
  }
  f = message.getReference();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.solutions.ComponentReference.serializeBinaryToWriter
    );
  }
};


/**
 * repeated BuildContext build_contexts = 1;
 * @return {!Array<!proto.solutions.BuildContext>}
 */
proto.solutions.ComponentSelectionRequest.prototype.getBuildContextsList = function() {
  return /** @type{!Array<!proto.solutions.BuildContext>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.solutions.BuildContext, 1));
};


/**
 * @param {!Array<!proto.solutions.BuildContext>} value
 * @return {!proto.solutions.ComponentSelectionRequest} returns this
*/
proto.solutions.ComponentSelectionRequest.prototype.setBuildContextsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.solutions.BuildContext=} opt_value
 * @param {number=} opt_index
 * @return {!proto.solutions.BuildContext}
 */
proto.solutions.ComponentSelectionRequest.prototype.addBuildContexts = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.solutions.BuildContext, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.ComponentSelectionRequest} returns this
 */
proto.solutions.ComponentSelectionRequest.prototype.clearBuildContextsList = function() {
  return this.setBuildContextsList([]);
};


/**
 * optional ComponentReference reference = 2;
 * @return {?proto.solutions.ComponentReference}
 */
proto.solutions.ComponentSelectionRequest.prototype.getReference = function() {
  return /** @type{?proto.solutions.ComponentReference} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ComponentReference, 2));
};


/**
 * @param {?proto.solutions.ComponentReference|undefined} value
 * @return {!proto.solutions.ComponentSelectionRequest} returns this
*/
proto.solutions.ComponentSelectionRequest.prototype.setReference = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ComponentSelectionRequest} returns this
 */
proto.solutions.ComponentSelectionRequest.prototype.clearReference = function() {
  return this.setReference(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ComponentSelectionRequest.prototype.hasReference = function() {
  return jspb.Message.getField(this, 2) != null;
};



/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.solutions.ComponentValidation.oneofGroups_ = [[5,6,7,8,9,10,11,12]];

/**
 * @enum {number}
 */
proto.solutions.ComponentValidation.ValidationTypeCase = {
  VALIDATION_TYPE_NOT_SET: 0,
  NOT_FOUND_IN_PACK_CACHE: 5,
  MATCHES_MANY_IN_PACK_CACHE: 6,
  NOT_FOUND_IN_PACK_SCOPE: 7,
  MATCHES_MANY_IN_PACK_SCOPE: 8,
  INCOMPATIBLE_WITH_DEVICE_AND_TOOLCHAIN: 9,
  HAS_FAILING_CONDITIONS: 10,
  HAS_UNRESOLVABLE_DEPENDENCIES: 11,
  HAS_DEPENDENCIES_INCOMPATIBLE_WITH_DEVICE_AND_TOOLCHAIN: 12
};

/**
 * @return {proto.solutions.ComponentValidation.ValidationTypeCase}
 */
proto.solutions.ComponentValidation.prototype.getValidationTypeCase = function() {
  return /** @type {proto.solutions.ComponentValidation.ValidationTypeCase} */(jspb.Message.computeOneofCase(this, proto.solutions.ComponentValidation.oneofGroups_[0]));
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.ComponentValidation.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.ComponentValidation.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.ComponentValidation} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentValidation.toObject = function(includeInstance, msg) {
  var f, obj = {
    component: (f = msg.getComponent()) && proto.solutions.TrackedComponentReference.toObject(includeInstance, f),
    projectId: (f = msg.getProjectId()) && proto.solutions.ProjectId.toObject(includeInstance, f),
    buildContext: (f = msg.getBuildContext()) && proto.solutions.BuildContext.toObject(includeInstance, f),
    message: jspb.Message.getFieldWithDefault(msg, 4, ""),
    notFoundInPackCache: (f = msg.getNotFoundInPackCache()) && proto.solutions.ComponentNotFoundInPackCache.toObject(includeInstance, f),
    matchesManyInPackCache: (f = msg.getMatchesManyInPackCache()) && proto.solutions.ComponentMatchesManyInPackCache.toObject(includeInstance, f),
    notFoundInPackScope: (f = msg.getNotFoundInPackScope()) && proto.solutions.ComponentNotFoundInPackScope.toObject(includeInstance, f),
    matchesManyInPackScope: (f = msg.getMatchesManyInPackScope()) && proto.solutions.ComponentMatchesManyInPackScope.toObject(includeInstance, f),
    incompatibleWithDeviceAndToolchain: (f = msg.getIncompatibleWithDeviceAndToolchain()) && proto.solutions.ComponentIncompatibleWithDeviceAndToolchain.toObject(includeInstance, f),
    hasFailingConditions: (f = msg.getHasFailingConditions()) && proto.solutions.ComponentHasFailingConditions.toObject(includeInstance, f),
    hasUnresolvableDependencies: (f = msg.getHasUnresolvableDependencies()) && proto.solutions.ComponentHasUnresolvableDependencies.toObject(includeInstance, f),
    hasDependenciesIncompatibleWithDeviceAndToolchain: (f = msg.getHasDependenciesIncompatibleWithDeviceAndToolchain()) && proto.solutions.ComponentHasDependenciesIncompatibleWithDeviceAndToolchain.toObject(includeInstance, f)
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
 * @return {!proto.solutions.ComponentValidation}
 */
proto.solutions.ComponentValidation.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.ComponentValidation;
  return proto.solutions.ComponentValidation.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.ComponentValidation} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.ComponentValidation}
 */
proto.solutions.ComponentValidation.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.TrackedComponentReference;
      reader.readMessage(value,proto.solutions.TrackedComponentReference.deserializeBinaryFromReader);
      msg.setComponent(value);
      break;
    case 2:
      var value = new proto.solutions.ProjectId;
      reader.readMessage(value,proto.solutions.ProjectId.deserializeBinaryFromReader);
      msg.setProjectId(value);
      break;
    case 3:
      var value = new proto.solutions.BuildContext;
      reader.readMessage(value,proto.solutions.BuildContext.deserializeBinaryFromReader);
      msg.setBuildContext(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setMessage(value);
      break;
    case 5:
      var value = new proto.solutions.ComponentNotFoundInPackCache;
      reader.readMessage(value,proto.solutions.ComponentNotFoundInPackCache.deserializeBinaryFromReader);
      msg.setNotFoundInPackCache(value);
      break;
    case 6:
      var value = new proto.solutions.ComponentMatchesManyInPackCache;
      reader.readMessage(value,proto.solutions.ComponentMatchesManyInPackCache.deserializeBinaryFromReader);
      msg.setMatchesManyInPackCache(value);
      break;
    case 7:
      var value = new proto.solutions.ComponentNotFoundInPackScope;
      reader.readMessage(value,proto.solutions.ComponentNotFoundInPackScope.deserializeBinaryFromReader);
      msg.setNotFoundInPackScope(value);
      break;
    case 8:
      var value = new proto.solutions.ComponentMatchesManyInPackScope;
      reader.readMessage(value,proto.solutions.ComponentMatchesManyInPackScope.deserializeBinaryFromReader);
      msg.setMatchesManyInPackScope(value);
      break;
    case 9:
      var value = new proto.solutions.ComponentIncompatibleWithDeviceAndToolchain;
      reader.readMessage(value,proto.solutions.ComponentIncompatibleWithDeviceAndToolchain.deserializeBinaryFromReader);
      msg.setIncompatibleWithDeviceAndToolchain(value);
      break;
    case 10:
      var value = new proto.solutions.ComponentHasFailingConditions;
      reader.readMessage(value,proto.solutions.ComponentHasFailingConditions.deserializeBinaryFromReader);
      msg.setHasFailingConditions(value);
      break;
    case 11:
      var value = new proto.solutions.ComponentHasUnresolvableDependencies;
      reader.readMessage(value,proto.solutions.ComponentHasUnresolvableDependencies.deserializeBinaryFromReader);
      msg.setHasUnresolvableDependencies(value);
      break;
    case 12:
      var value = new proto.solutions.ComponentHasDependenciesIncompatibleWithDeviceAndToolchain;
      reader.readMessage(value,proto.solutions.ComponentHasDependenciesIncompatibleWithDeviceAndToolchain.deserializeBinaryFromReader);
      msg.setHasDependenciesIncompatibleWithDeviceAndToolchain(value);
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
proto.solutions.ComponentValidation.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.ComponentValidation.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.ComponentValidation} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentValidation.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getComponent();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.TrackedComponentReference.serializeBinaryToWriter
    );
  }
  f = message.getProjectId();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.solutions.ProjectId.serializeBinaryToWriter
    );
  }
  f = message.getBuildContext();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.solutions.BuildContext.serializeBinaryToWriter
    );
  }
  f = message.getMessage();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getNotFoundInPackCache();
  if (f != null) {
    writer.writeMessage(
      5,
      f,
      proto.solutions.ComponentNotFoundInPackCache.serializeBinaryToWriter
    );
  }
  f = message.getMatchesManyInPackCache();
  if (f != null) {
    writer.writeMessage(
      6,
      f,
      proto.solutions.ComponentMatchesManyInPackCache.serializeBinaryToWriter
    );
  }
  f = message.getNotFoundInPackScope();
  if (f != null) {
    writer.writeMessage(
      7,
      f,
      proto.solutions.ComponentNotFoundInPackScope.serializeBinaryToWriter
    );
  }
  f = message.getMatchesManyInPackScope();
  if (f != null) {
    writer.writeMessage(
      8,
      f,
      proto.solutions.ComponentMatchesManyInPackScope.serializeBinaryToWriter
    );
  }
  f = message.getIncompatibleWithDeviceAndToolchain();
  if (f != null) {
    writer.writeMessage(
      9,
      f,
      proto.solutions.ComponentIncompatibleWithDeviceAndToolchain.serializeBinaryToWriter
    );
  }
  f = message.getHasFailingConditions();
  if (f != null) {
    writer.writeMessage(
      10,
      f,
      proto.solutions.ComponentHasFailingConditions.serializeBinaryToWriter
    );
  }
  f = message.getHasUnresolvableDependencies();
  if (f != null) {
    writer.writeMessage(
      11,
      f,
      proto.solutions.ComponentHasUnresolvableDependencies.serializeBinaryToWriter
    );
  }
  f = message.getHasDependenciesIncompatibleWithDeviceAndToolchain();
  if (f != null) {
    writer.writeMessage(
      12,
      f,
      proto.solutions.ComponentHasDependenciesIncompatibleWithDeviceAndToolchain.serializeBinaryToWriter
    );
  }
};


/**
 * optional TrackedComponentReference component = 1;
 * @return {?proto.solutions.TrackedComponentReference}
 */
proto.solutions.ComponentValidation.prototype.getComponent = function() {
  return /** @type{?proto.solutions.TrackedComponentReference} */ (
    jspb.Message.getWrapperField(this, proto.solutions.TrackedComponentReference, 1));
};


/**
 * @param {?proto.solutions.TrackedComponentReference|undefined} value
 * @return {!proto.solutions.ComponentValidation} returns this
*/
proto.solutions.ComponentValidation.prototype.setComponent = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ComponentValidation} returns this
 */
proto.solutions.ComponentValidation.prototype.clearComponent = function() {
  return this.setComponent(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ComponentValidation.prototype.hasComponent = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional ProjectId project_id = 2;
 * @return {?proto.solutions.ProjectId}
 */
proto.solutions.ComponentValidation.prototype.getProjectId = function() {
  return /** @type{?proto.solutions.ProjectId} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ProjectId, 2));
};


/**
 * @param {?proto.solutions.ProjectId|undefined} value
 * @return {!proto.solutions.ComponentValidation} returns this
*/
proto.solutions.ComponentValidation.prototype.setProjectId = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ComponentValidation} returns this
 */
proto.solutions.ComponentValidation.prototype.clearProjectId = function() {
  return this.setProjectId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ComponentValidation.prototype.hasProjectId = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional BuildContext build_context = 3;
 * @return {?proto.solutions.BuildContext}
 */
proto.solutions.ComponentValidation.prototype.getBuildContext = function() {
  return /** @type{?proto.solutions.BuildContext} */ (
    jspb.Message.getWrapperField(this, proto.solutions.BuildContext, 3));
};


/**
 * @param {?proto.solutions.BuildContext|undefined} value
 * @return {!proto.solutions.ComponentValidation} returns this
*/
proto.solutions.ComponentValidation.prototype.setBuildContext = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ComponentValidation} returns this
 */
proto.solutions.ComponentValidation.prototype.clearBuildContext = function() {
  return this.setBuildContext(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ComponentValidation.prototype.hasBuildContext = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional string message = 4;
 * @return {string}
 */
proto.solutions.ComponentValidation.prototype.getMessage = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.ComponentValidation} returns this
 */
proto.solutions.ComponentValidation.prototype.setMessage = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional ComponentNotFoundInPackCache not_found_in_pack_cache = 5;
 * @return {?proto.solutions.ComponentNotFoundInPackCache}
 */
proto.solutions.ComponentValidation.prototype.getNotFoundInPackCache = function() {
  return /** @type{?proto.solutions.ComponentNotFoundInPackCache} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ComponentNotFoundInPackCache, 5));
};


/**
 * @param {?proto.solutions.ComponentNotFoundInPackCache|undefined} value
 * @return {!proto.solutions.ComponentValidation} returns this
*/
proto.solutions.ComponentValidation.prototype.setNotFoundInPackCache = function(value) {
  return jspb.Message.setOneofWrapperField(this, 5, proto.solutions.ComponentValidation.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ComponentValidation} returns this
 */
proto.solutions.ComponentValidation.prototype.clearNotFoundInPackCache = function() {
  return this.setNotFoundInPackCache(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ComponentValidation.prototype.hasNotFoundInPackCache = function() {
  return jspb.Message.getField(this, 5) != null;
};


/**
 * optional ComponentMatchesManyInPackCache matches_many_in_pack_cache = 6;
 * @return {?proto.solutions.ComponentMatchesManyInPackCache}
 */
proto.solutions.ComponentValidation.prototype.getMatchesManyInPackCache = function() {
  return /** @type{?proto.solutions.ComponentMatchesManyInPackCache} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ComponentMatchesManyInPackCache, 6));
};


/**
 * @param {?proto.solutions.ComponentMatchesManyInPackCache|undefined} value
 * @return {!proto.solutions.ComponentValidation} returns this
*/
proto.solutions.ComponentValidation.prototype.setMatchesManyInPackCache = function(value) {
  return jspb.Message.setOneofWrapperField(this, 6, proto.solutions.ComponentValidation.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ComponentValidation} returns this
 */
proto.solutions.ComponentValidation.prototype.clearMatchesManyInPackCache = function() {
  return this.setMatchesManyInPackCache(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ComponentValidation.prototype.hasMatchesManyInPackCache = function() {
  return jspb.Message.getField(this, 6) != null;
};


/**
 * optional ComponentNotFoundInPackScope not_found_in_pack_scope = 7;
 * @return {?proto.solutions.ComponentNotFoundInPackScope}
 */
proto.solutions.ComponentValidation.prototype.getNotFoundInPackScope = function() {
  return /** @type{?proto.solutions.ComponentNotFoundInPackScope} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ComponentNotFoundInPackScope, 7));
};


/**
 * @param {?proto.solutions.ComponentNotFoundInPackScope|undefined} value
 * @return {!proto.solutions.ComponentValidation} returns this
*/
proto.solutions.ComponentValidation.prototype.setNotFoundInPackScope = function(value) {
  return jspb.Message.setOneofWrapperField(this, 7, proto.solutions.ComponentValidation.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ComponentValidation} returns this
 */
proto.solutions.ComponentValidation.prototype.clearNotFoundInPackScope = function() {
  return this.setNotFoundInPackScope(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ComponentValidation.prototype.hasNotFoundInPackScope = function() {
  return jspb.Message.getField(this, 7) != null;
};


/**
 * optional ComponentMatchesManyInPackScope matches_many_in_pack_scope = 8;
 * @return {?proto.solutions.ComponentMatchesManyInPackScope}
 */
proto.solutions.ComponentValidation.prototype.getMatchesManyInPackScope = function() {
  return /** @type{?proto.solutions.ComponentMatchesManyInPackScope} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ComponentMatchesManyInPackScope, 8));
};


/**
 * @param {?proto.solutions.ComponentMatchesManyInPackScope|undefined} value
 * @return {!proto.solutions.ComponentValidation} returns this
*/
proto.solutions.ComponentValidation.prototype.setMatchesManyInPackScope = function(value) {
  return jspb.Message.setOneofWrapperField(this, 8, proto.solutions.ComponentValidation.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ComponentValidation} returns this
 */
proto.solutions.ComponentValidation.prototype.clearMatchesManyInPackScope = function() {
  return this.setMatchesManyInPackScope(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ComponentValidation.prototype.hasMatchesManyInPackScope = function() {
  return jspb.Message.getField(this, 8) != null;
};


/**
 * optional ComponentIncompatibleWithDeviceAndToolchain incompatible_with_device_and_toolchain = 9;
 * @return {?proto.solutions.ComponentIncompatibleWithDeviceAndToolchain}
 */
proto.solutions.ComponentValidation.prototype.getIncompatibleWithDeviceAndToolchain = function() {
  return /** @type{?proto.solutions.ComponentIncompatibleWithDeviceAndToolchain} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ComponentIncompatibleWithDeviceAndToolchain, 9));
};


/**
 * @param {?proto.solutions.ComponentIncompatibleWithDeviceAndToolchain|undefined} value
 * @return {!proto.solutions.ComponentValidation} returns this
*/
proto.solutions.ComponentValidation.prototype.setIncompatibleWithDeviceAndToolchain = function(value) {
  return jspb.Message.setOneofWrapperField(this, 9, proto.solutions.ComponentValidation.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ComponentValidation} returns this
 */
proto.solutions.ComponentValidation.prototype.clearIncompatibleWithDeviceAndToolchain = function() {
  return this.setIncompatibleWithDeviceAndToolchain(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ComponentValidation.prototype.hasIncompatibleWithDeviceAndToolchain = function() {
  return jspb.Message.getField(this, 9) != null;
};


/**
 * optional ComponentHasFailingConditions has_failing_conditions = 10;
 * @return {?proto.solutions.ComponentHasFailingConditions}
 */
proto.solutions.ComponentValidation.prototype.getHasFailingConditions = function() {
  return /** @type{?proto.solutions.ComponentHasFailingConditions} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ComponentHasFailingConditions, 10));
};


/**
 * @param {?proto.solutions.ComponentHasFailingConditions|undefined} value
 * @return {!proto.solutions.ComponentValidation} returns this
*/
proto.solutions.ComponentValidation.prototype.setHasFailingConditions = function(value) {
  return jspb.Message.setOneofWrapperField(this, 10, proto.solutions.ComponentValidation.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ComponentValidation} returns this
 */
proto.solutions.ComponentValidation.prototype.clearHasFailingConditions = function() {
  return this.setHasFailingConditions(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ComponentValidation.prototype.hasHasFailingConditions = function() {
  return jspb.Message.getField(this, 10) != null;
};


/**
 * optional ComponentHasUnresolvableDependencies has_unresolvable_dependencies = 11;
 * @return {?proto.solutions.ComponentHasUnresolvableDependencies}
 */
proto.solutions.ComponentValidation.prototype.getHasUnresolvableDependencies = function() {
  return /** @type{?proto.solutions.ComponentHasUnresolvableDependencies} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ComponentHasUnresolvableDependencies, 11));
};


/**
 * @param {?proto.solutions.ComponentHasUnresolvableDependencies|undefined} value
 * @return {!proto.solutions.ComponentValidation} returns this
*/
proto.solutions.ComponentValidation.prototype.setHasUnresolvableDependencies = function(value) {
  return jspb.Message.setOneofWrapperField(this, 11, proto.solutions.ComponentValidation.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ComponentValidation} returns this
 */
proto.solutions.ComponentValidation.prototype.clearHasUnresolvableDependencies = function() {
  return this.setHasUnresolvableDependencies(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ComponentValidation.prototype.hasHasUnresolvableDependencies = function() {
  return jspb.Message.getField(this, 11) != null;
};


/**
 * optional ComponentHasDependenciesIncompatibleWithDeviceAndToolchain has_dependencies_incompatible_with_device_and_toolchain = 12;
 * @return {?proto.solutions.ComponentHasDependenciesIncompatibleWithDeviceAndToolchain}
 */
proto.solutions.ComponentValidation.prototype.getHasDependenciesIncompatibleWithDeviceAndToolchain = function() {
  return /** @type{?proto.solutions.ComponentHasDependenciesIncompatibleWithDeviceAndToolchain} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ComponentHasDependenciesIncompatibleWithDeviceAndToolchain, 12));
};


/**
 * @param {?proto.solutions.ComponentHasDependenciesIncompatibleWithDeviceAndToolchain|undefined} value
 * @return {!proto.solutions.ComponentValidation} returns this
*/
proto.solutions.ComponentValidation.prototype.setHasDependenciesIncompatibleWithDeviceAndToolchain = function(value) {
  return jspb.Message.setOneofWrapperField(this, 12, proto.solutions.ComponentValidation.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ComponentValidation} returns this
 */
proto.solutions.ComponentValidation.prototype.clearHasDependenciesIncompatibleWithDeviceAndToolchain = function() {
  return this.setHasDependenciesIncompatibleWithDeviceAndToolchain(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ComponentValidation.prototype.hasHasDependenciesIncompatibleWithDeviceAndToolchain = function() {
  return jspb.Message.getField(this, 12) != null;
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.ComponentNotFoundInPackCache.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.ComponentNotFoundInPackCache.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.ComponentNotFoundInPackCache} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentNotFoundInPackCache.toObject = function(includeInstance, msg) {
  var f, obj = {

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
 * @return {!proto.solutions.ComponentNotFoundInPackCache}
 */
proto.solutions.ComponentNotFoundInPackCache.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.ComponentNotFoundInPackCache;
  return proto.solutions.ComponentNotFoundInPackCache.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.ComponentNotFoundInPackCache} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.ComponentNotFoundInPackCache}
 */
proto.solutions.ComponentNotFoundInPackCache.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
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
proto.solutions.ComponentNotFoundInPackCache.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.ComponentNotFoundInPackCache.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.ComponentNotFoundInPackCache} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentNotFoundInPackCache.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.solutions.ComponentNotFoundInPackScope.repeatedFields_ = [1];



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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.ComponentNotFoundInPackScope.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.ComponentNotFoundInPackScope.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.ComponentNotFoundInPackScope} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentNotFoundInPackScope.toObject = function(includeInstance, msg) {
  var f, obj = {
    packIdsList: jspb.Message.toObjectList(msg.getPackIdsList(),
    packsproto_packs_pb.PackId.toObject, includeInstance)
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
 * @return {!proto.solutions.ComponentNotFoundInPackScope}
 */
proto.solutions.ComponentNotFoundInPackScope.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.ComponentNotFoundInPackScope;
  return proto.solutions.ComponentNotFoundInPackScope.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.ComponentNotFoundInPackScope} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.ComponentNotFoundInPackScope}
 */
proto.solutions.ComponentNotFoundInPackScope.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new packsproto_packs_pb.PackId;
      reader.readMessage(value,packsproto_packs_pb.PackId.deserializeBinaryFromReader);
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
proto.solutions.ComponentNotFoundInPackScope.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.ComponentNotFoundInPackScope.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.ComponentNotFoundInPackScope} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentNotFoundInPackScope.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPackIdsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      packsproto_packs_pb.PackId.serializeBinaryToWriter
    );
  }
};


/**
 * repeated packs.PackId pack_ids = 1;
 * @return {!Array<!proto.packs.PackId>}
 */
proto.solutions.ComponentNotFoundInPackScope.prototype.getPackIdsList = function() {
  return /** @type{!Array<!proto.packs.PackId>} */ (
    jspb.Message.getRepeatedWrapperField(this, packsproto_packs_pb.PackId, 1));
};


/**
 * @param {!Array<!proto.packs.PackId>} value
 * @return {!proto.solutions.ComponentNotFoundInPackScope} returns this
*/
proto.solutions.ComponentNotFoundInPackScope.prototype.setPackIdsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.packs.PackId=} opt_value
 * @param {number=} opt_index
 * @return {!proto.packs.PackId}
 */
proto.solutions.ComponentNotFoundInPackScope.prototype.addPackIds = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.packs.PackId, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.ComponentNotFoundInPackScope} returns this
 */
proto.solutions.ComponentNotFoundInPackScope.prototype.clearPackIdsList = function() {
  return this.setPackIdsList([]);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.solutions.ComponentMatchesManyInPackCache.repeatedFields_ = [1];



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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.ComponentMatchesManyInPackCache.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.ComponentMatchesManyInPackCache.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.ComponentMatchesManyInPackCache} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentMatchesManyInPackCache.toObject = function(includeInstance, msg) {
  var f, obj = {
    componentIdsList: jspb.Message.toObjectList(msg.getComponentIdsList(),
    packsproto_packs_pb.ComponentId.toObject, includeInstance)
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
 * @return {!proto.solutions.ComponentMatchesManyInPackCache}
 */
proto.solutions.ComponentMatchesManyInPackCache.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.ComponentMatchesManyInPackCache;
  return proto.solutions.ComponentMatchesManyInPackCache.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.ComponentMatchesManyInPackCache} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.ComponentMatchesManyInPackCache}
 */
proto.solutions.ComponentMatchesManyInPackCache.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new packsproto_packs_pb.ComponentId;
      reader.readMessage(value,packsproto_packs_pb.ComponentId.deserializeBinaryFromReader);
      msg.addComponentIds(value);
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
proto.solutions.ComponentMatchesManyInPackCache.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.ComponentMatchesManyInPackCache.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.ComponentMatchesManyInPackCache} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentMatchesManyInPackCache.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getComponentIdsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      packsproto_packs_pb.ComponentId.serializeBinaryToWriter
    );
  }
};


/**
 * repeated packs.ComponentId component_ids = 1;
 * @return {!Array<!proto.packs.ComponentId>}
 */
proto.solutions.ComponentMatchesManyInPackCache.prototype.getComponentIdsList = function() {
  return /** @type{!Array<!proto.packs.ComponentId>} */ (
    jspb.Message.getRepeatedWrapperField(this, packsproto_packs_pb.ComponentId, 1));
};


/**
 * @param {!Array<!proto.packs.ComponentId>} value
 * @return {!proto.solutions.ComponentMatchesManyInPackCache} returns this
*/
proto.solutions.ComponentMatchesManyInPackCache.prototype.setComponentIdsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.packs.ComponentId=} opt_value
 * @param {number=} opt_index
 * @return {!proto.packs.ComponentId}
 */
proto.solutions.ComponentMatchesManyInPackCache.prototype.addComponentIds = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.packs.ComponentId, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.ComponentMatchesManyInPackCache} returns this
 */
proto.solutions.ComponentMatchesManyInPackCache.prototype.clearComponentIdsList = function() {
  return this.setComponentIdsList([]);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.solutions.ComponentMatchesManyInPackScope.repeatedFields_ = [1];



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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.ComponentMatchesManyInPackScope.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.ComponentMatchesManyInPackScope.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.ComponentMatchesManyInPackScope} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentMatchesManyInPackScope.toObject = function(includeInstance, msg) {
  var f, obj = {
    componentIdsList: jspb.Message.toObjectList(msg.getComponentIdsList(),
    packsproto_packs_pb.ComponentId.toObject, includeInstance)
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
 * @return {!proto.solutions.ComponentMatchesManyInPackScope}
 */
proto.solutions.ComponentMatchesManyInPackScope.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.ComponentMatchesManyInPackScope;
  return proto.solutions.ComponentMatchesManyInPackScope.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.ComponentMatchesManyInPackScope} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.ComponentMatchesManyInPackScope}
 */
proto.solutions.ComponentMatchesManyInPackScope.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new packsproto_packs_pb.ComponentId;
      reader.readMessage(value,packsproto_packs_pb.ComponentId.deserializeBinaryFromReader);
      msg.addComponentIds(value);
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
proto.solutions.ComponentMatchesManyInPackScope.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.ComponentMatchesManyInPackScope.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.ComponentMatchesManyInPackScope} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentMatchesManyInPackScope.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getComponentIdsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      packsproto_packs_pb.ComponentId.serializeBinaryToWriter
    );
  }
};


/**
 * repeated packs.ComponentId component_ids = 1;
 * @return {!Array<!proto.packs.ComponentId>}
 */
proto.solutions.ComponentMatchesManyInPackScope.prototype.getComponentIdsList = function() {
  return /** @type{!Array<!proto.packs.ComponentId>} */ (
    jspb.Message.getRepeatedWrapperField(this, packsproto_packs_pb.ComponentId, 1));
};


/**
 * @param {!Array<!proto.packs.ComponentId>} value
 * @return {!proto.solutions.ComponentMatchesManyInPackScope} returns this
*/
proto.solutions.ComponentMatchesManyInPackScope.prototype.setComponentIdsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.packs.ComponentId=} opt_value
 * @param {number=} opt_index
 * @return {!proto.packs.ComponentId}
 */
proto.solutions.ComponentMatchesManyInPackScope.prototype.addComponentIds = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.packs.ComponentId, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.ComponentMatchesManyInPackScope} returns this
 */
proto.solutions.ComponentMatchesManyInPackScope.prototype.clearComponentIdsList = function() {
  return this.setComponentIdsList([]);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.solutions.ComponentIncompatibleWithDeviceAndToolchain.repeatedFields_ = [1];



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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.ComponentIncompatibleWithDeviceAndToolchain.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.ComponentIncompatibleWithDeviceAndToolchain.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.ComponentIncompatibleWithDeviceAndToolchain} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentIncompatibleWithDeviceAndToolchain.toObject = function(includeInstance, msg) {
  var f, obj = {
    constraintsList: jspb.Message.toObjectList(msg.getConstraintsList(),
    proto.solutions.DeviceAndToolchainConstraints.toObject, includeInstance)
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
 * @return {!proto.solutions.ComponentIncompatibleWithDeviceAndToolchain}
 */
proto.solutions.ComponentIncompatibleWithDeviceAndToolchain.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.ComponentIncompatibleWithDeviceAndToolchain;
  return proto.solutions.ComponentIncompatibleWithDeviceAndToolchain.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.ComponentIncompatibleWithDeviceAndToolchain} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.ComponentIncompatibleWithDeviceAndToolchain}
 */
proto.solutions.ComponentIncompatibleWithDeviceAndToolchain.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.DeviceAndToolchainConstraints;
      reader.readMessage(value,proto.solutions.DeviceAndToolchainConstraints.deserializeBinaryFromReader);
      msg.addConstraints(value);
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
proto.solutions.ComponentIncompatibleWithDeviceAndToolchain.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.ComponentIncompatibleWithDeviceAndToolchain.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.ComponentIncompatibleWithDeviceAndToolchain} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentIncompatibleWithDeviceAndToolchain.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getConstraintsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.solutions.DeviceAndToolchainConstraints.serializeBinaryToWriter
    );
  }
};


/**
 * repeated DeviceAndToolchainConstraints constraints = 1;
 * @return {!Array<!proto.solutions.DeviceAndToolchainConstraints>}
 */
proto.solutions.ComponentIncompatibleWithDeviceAndToolchain.prototype.getConstraintsList = function() {
  return /** @type{!Array<!proto.solutions.DeviceAndToolchainConstraints>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.solutions.DeviceAndToolchainConstraints, 1));
};


/**
 * @param {!Array<!proto.solutions.DeviceAndToolchainConstraints>} value
 * @return {!proto.solutions.ComponentIncompatibleWithDeviceAndToolchain} returns this
*/
proto.solutions.ComponentIncompatibleWithDeviceAndToolchain.prototype.setConstraintsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.solutions.DeviceAndToolchainConstraints=} opt_value
 * @param {number=} opt_index
 * @return {!proto.solutions.DeviceAndToolchainConstraints}
 */
proto.solutions.ComponentIncompatibleWithDeviceAndToolchain.prototype.addConstraints = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.solutions.DeviceAndToolchainConstraints, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.ComponentIncompatibleWithDeviceAndToolchain} returns this
 */
proto.solutions.ComponentIncompatibleWithDeviceAndToolchain.prototype.clearConstraintsList = function() {
  return this.setConstraintsList([]);
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.DeviceAndToolchainConstraints.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.DeviceAndToolchainConstraints.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.DeviceAndToolchainConstraints} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.DeviceAndToolchainConstraints.toObject = function(includeInstance, msg) {
  var f, obj = {
    attributeToConstraintMap: (f = msg.getAttributeToConstraintMap()) ? f.toObject(includeInstance, proto.solutions.DeviceAndToolchainConstraint.toObject) : []
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
 * @return {!proto.solutions.DeviceAndToolchainConstraints}
 */
proto.solutions.DeviceAndToolchainConstraints.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.DeviceAndToolchainConstraints;
  return proto.solutions.DeviceAndToolchainConstraints.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.DeviceAndToolchainConstraints} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.DeviceAndToolchainConstraints}
 */
proto.solutions.DeviceAndToolchainConstraints.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = msg.getAttributeToConstraintMap();
      reader.readMessage(value, function(message, reader) {
        jspb.Map.deserializeBinary(message, reader, jspb.BinaryReader.prototype.readString, jspb.BinaryReader.prototype.readMessage, proto.solutions.DeviceAndToolchainConstraint.deserializeBinaryFromReader, "", new proto.solutions.DeviceAndToolchainConstraint());
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
proto.solutions.DeviceAndToolchainConstraints.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.DeviceAndToolchainConstraints.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.DeviceAndToolchainConstraints} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.DeviceAndToolchainConstraints.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAttributeToConstraintMap(true);
  if (f && f.getLength() > 0) {
    f.serializeBinary(1, writer, jspb.BinaryWriter.prototype.writeString, jspb.BinaryWriter.prototype.writeMessage, proto.solutions.DeviceAndToolchainConstraint.serializeBinaryToWriter);
  }
};


/**
 * map<string, DeviceAndToolchainConstraint> attribute_to_constraint = 1;
 * @param {boolean=} opt_noLazyCreate Do not create the map if
 * empty, instead returning `undefined`
 * @return {!jspb.Map<string,!proto.solutions.DeviceAndToolchainConstraint>}
 */
proto.solutions.DeviceAndToolchainConstraints.prototype.getAttributeToConstraintMap = function(opt_noLazyCreate) {
  return /** @type {!jspb.Map<string,!proto.solutions.DeviceAndToolchainConstraint>} */ (
      jspb.Message.getMapField(this, 1, opt_noLazyCreate,
      proto.solutions.DeviceAndToolchainConstraint));
};


/**
 * Clears values from the map. The map will be non-null.
 * @return {!proto.solutions.DeviceAndToolchainConstraints} returns this
 */
proto.solutions.DeviceAndToolchainConstraints.prototype.clearAttributeToConstraintMap = function() {
  this.getAttributeToConstraintMap().clear();
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.DeviceAndToolchainConstraint.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.DeviceAndToolchainConstraint.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.DeviceAndToolchainConstraint} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.DeviceAndToolchainConstraint.toObject = function(includeInstance, msg) {
  var f, obj = {
    kind: jspb.Message.getFieldWithDefault(msg, 1, 0),
    value: jspb.Message.getFieldWithDefault(msg, 2, "")
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
 * @return {!proto.solutions.DeviceAndToolchainConstraint}
 */
proto.solutions.DeviceAndToolchainConstraint.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.DeviceAndToolchainConstraint;
  return proto.solutions.DeviceAndToolchainConstraint.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.DeviceAndToolchainConstraint} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.DeviceAndToolchainConstraint}
 */
proto.solutions.DeviceAndToolchainConstraint.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!proto.solutions.DeviceAndToolchainConstraint.Kind} */ (reader.readEnum());
      msg.setKind(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setValue(value);
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
proto.solutions.DeviceAndToolchainConstraint.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.DeviceAndToolchainConstraint.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.DeviceAndToolchainConstraint} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.DeviceAndToolchainConstraint.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getKind();
  if (f !== 0.0) {
    writer.writeEnum(
      1,
      f
    );
  }
  f = message.getValue();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
};


/**
 * @enum {number}
 */
proto.solutions.DeviceAndToolchainConstraint.Kind = {
  MATCH: 0,
  NOT_MATCH: 1
};

/**
 * optional Kind kind = 1;
 * @return {!proto.solutions.DeviceAndToolchainConstraint.Kind}
 */
proto.solutions.DeviceAndToolchainConstraint.prototype.getKind = function() {
  return /** @type {!proto.solutions.DeviceAndToolchainConstraint.Kind} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {!proto.solutions.DeviceAndToolchainConstraint.Kind} value
 * @return {!proto.solutions.DeviceAndToolchainConstraint} returns this
 */
proto.solutions.DeviceAndToolchainConstraint.prototype.setKind = function(value) {
  return jspb.Message.setProto3EnumField(this, 1, value);
};


/**
 * optional string value = 2;
 * @return {string}
 */
proto.solutions.DeviceAndToolchainConstraint.prototype.getValue = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.DeviceAndToolchainConstraint} returns this
 */
proto.solutions.DeviceAndToolchainConstraint.prototype.setValue = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.solutions.ComponentHasFailingConditions.repeatedFields_ = [1];



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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.ComponentHasFailingConditions.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.ComponentHasFailingConditions.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.ComponentHasFailingConditions} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentHasFailingConditions.toObject = function(includeInstance, msg) {
  var f, obj = {
    fixesList: jspb.Message.toObjectList(msg.getFixesList(),
    proto.solutions.ComponentConditionFixSet.toObject, includeInstance)
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
 * @return {!proto.solutions.ComponentHasFailingConditions}
 */
proto.solutions.ComponentHasFailingConditions.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.ComponentHasFailingConditions;
  return proto.solutions.ComponentHasFailingConditions.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.ComponentHasFailingConditions} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.ComponentHasFailingConditions}
 */
proto.solutions.ComponentHasFailingConditions.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.ComponentConditionFixSet;
      reader.readMessage(value,proto.solutions.ComponentConditionFixSet.deserializeBinaryFromReader);
      msg.addFixes(value);
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
proto.solutions.ComponentHasFailingConditions.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.ComponentHasFailingConditions.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.ComponentHasFailingConditions} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentHasFailingConditions.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getFixesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.solutions.ComponentConditionFixSet.serializeBinaryToWriter
    );
  }
};


/**
 * repeated ComponentConditionFixSet fixes = 1;
 * @return {!Array<!proto.solutions.ComponentConditionFixSet>}
 */
proto.solutions.ComponentHasFailingConditions.prototype.getFixesList = function() {
  return /** @type{!Array<!proto.solutions.ComponentConditionFixSet>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.solutions.ComponentConditionFixSet, 1));
};


/**
 * @param {!Array<!proto.solutions.ComponentConditionFixSet>} value
 * @return {!proto.solutions.ComponentHasFailingConditions} returns this
*/
proto.solutions.ComponentHasFailingConditions.prototype.setFixesList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.solutions.ComponentConditionFixSet=} opt_value
 * @param {number=} opt_index
 * @return {!proto.solutions.ComponentConditionFixSet}
 */
proto.solutions.ComponentHasFailingConditions.prototype.addFixes = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.solutions.ComponentConditionFixSet, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.ComponentHasFailingConditions} returns this
 */
proto.solutions.ComponentHasFailingConditions.prototype.clearFixesList = function() {
  return this.setFixesList([]);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.solutions.ComponentConditionFixSet.repeatedFields_ = [1];



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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.ComponentConditionFixSet.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.ComponentConditionFixSet.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.ComponentConditionFixSet} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentConditionFixSet.toObject = function(includeInstance, msg) {
  var f, obj = {
    fixesList: jspb.Message.toObjectList(msg.getFixesList(),
    proto.solutions.ComponentConditionFix.toObject, includeInstance)
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
 * @return {!proto.solutions.ComponentConditionFixSet}
 */
proto.solutions.ComponentConditionFixSet.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.ComponentConditionFixSet;
  return proto.solutions.ComponentConditionFixSet.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.ComponentConditionFixSet} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.ComponentConditionFixSet}
 */
proto.solutions.ComponentConditionFixSet.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.ComponentConditionFix;
      reader.readMessage(value,proto.solutions.ComponentConditionFix.deserializeBinaryFromReader);
      msg.addFixes(value);
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
proto.solutions.ComponentConditionFixSet.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.ComponentConditionFixSet.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.ComponentConditionFixSet} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentConditionFixSet.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getFixesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.solutions.ComponentConditionFix.serializeBinaryToWriter
    );
  }
};


/**
 * repeated ComponentConditionFix fixes = 1;
 * @return {!Array<!proto.solutions.ComponentConditionFix>}
 */
proto.solutions.ComponentConditionFixSet.prototype.getFixesList = function() {
  return /** @type{!Array<!proto.solutions.ComponentConditionFix>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.solutions.ComponentConditionFix, 1));
};


/**
 * @param {!Array<!proto.solutions.ComponentConditionFix>} value
 * @return {!proto.solutions.ComponentConditionFixSet} returns this
*/
proto.solutions.ComponentConditionFixSet.prototype.setFixesList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.solutions.ComponentConditionFix=} opt_value
 * @param {number=} opt_index
 * @return {!proto.solutions.ComponentConditionFix}
 */
proto.solutions.ComponentConditionFixSet.prototype.addFixes = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.solutions.ComponentConditionFix, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.ComponentConditionFixSet} returns this
 */
proto.solutions.ComponentConditionFixSet.prototype.clearFixesList = function() {
  return this.setFixesList([]);
};



/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.solutions.ComponentConditionFix.oneofGroups_ = [[1,2]];

/**
 * @enum {number}
 */
proto.solutions.ComponentConditionFix.TypeCase = {
  TYPE_NOT_SET: 0,
  ADD_DEPENDENT_COMPONENT: 1,
  REMOVE_CONFLICTING_COMPONENT: 2
};

/**
 * @return {proto.solutions.ComponentConditionFix.TypeCase}
 */
proto.solutions.ComponentConditionFix.prototype.getTypeCase = function() {
  return /** @type {proto.solutions.ComponentConditionFix.TypeCase} */(jspb.Message.computeOneofCase(this, proto.solutions.ComponentConditionFix.oneofGroups_[0]));
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.ComponentConditionFix.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.ComponentConditionFix.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.ComponentConditionFix} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentConditionFix.toObject = function(includeInstance, msg) {
  var f, obj = {
    addDependentComponent: (f = msg.getAddDependentComponent()) && packsproto_packs_pb.ListComponentsRequest.toObject(includeInstance, f),
    removeConflictingComponent: (f = msg.getRemoveConflictingComponent()) && proto.solutions.TrackedComponentReference.toObject(includeInstance, f)
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
 * @return {!proto.solutions.ComponentConditionFix}
 */
proto.solutions.ComponentConditionFix.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.ComponentConditionFix;
  return proto.solutions.ComponentConditionFix.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.ComponentConditionFix} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.ComponentConditionFix}
 */
proto.solutions.ComponentConditionFix.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new packsproto_packs_pb.ListComponentsRequest;
      reader.readMessage(value,packsproto_packs_pb.ListComponentsRequest.deserializeBinaryFromReader);
      msg.setAddDependentComponent(value);
      break;
    case 2:
      var value = new proto.solutions.TrackedComponentReference;
      reader.readMessage(value,proto.solutions.TrackedComponentReference.deserializeBinaryFromReader);
      msg.setRemoveConflictingComponent(value);
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
proto.solutions.ComponentConditionFix.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.ComponentConditionFix.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.ComponentConditionFix} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentConditionFix.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAddDependentComponent();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      packsproto_packs_pb.ListComponentsRequest.serializeBinaryToWriter
    );
  }
  f = message.getRemoveConflictingComponent();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.solutions.TrackedComponentReference.serializeBinaryToWriter
    );
  }
};


/**
 * optional packs.ListComponentsRequest add_dependent_component = 1;
 * @return {?proto.packs.ListComponentsRequest}
 */
proto.solutions.ComponentConditionFix.prototype.getAddDependentComponent = function() {
  return /** @type{?proto.packs.ListComponentsRequest} */ (
    jspb.Message.getWrapperField(this, packsproto_packs_pb.ListComponentsRequest, 1));
};


/**
 * @param {?proto.packs.ListComponentsRequest|undefined} value
 * @return {!proto.solutions.ComponentConditionFix} returns this
*/
proto.solutions.ComponentConditionFix.prototype.setAddDependentComponent = function(value) {
  return jspb.Message.setOneofWrapperField(this, 1, proto.solutions.ComponentConditionFix.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ComponentConditionFix} returns this
 */
proto.solutions.ComponentConditionFix.prototype.clearAddDependentComponent = function() {
  return this.setAddDependentComponent(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ComponentConditionFix.prototype.hasAddDependentComponent = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional TrackedComponentReference remove_conflicting_component = 2;
 * @return {?proto.solutions.TrackedComponentReference}
 */
proto.solutions.ComponentConditionFix.prototype.getRemoveConflictingComponent = function() {
  return /** @type{?proto.solutions.TrackedComponentReference} */ (
    jspb.Message.getWrapperField(this, proto.solutions.TrackedComponentReference, 2));
};


/**
 * @param {?proto.solutions.TrackedComponentReference|undefined} value
 * @return {!proto.solutions.ComponentConditionFix} returns this
*/
proto.solutions.ComponentConditionFix.prototype.setRemoveConflictingComponent = function(value) {
  return jspb.Message.setOneofWrapperField(this, 2, proto.solutions.ComponentConditionFix.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ComponentConditionFix} returns this
 */
proto.solutions.ComponentConditionFix.prototype.clearRemoveConflictingComponent = function() {
  return this.setRemoveConflictingComponent(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ComponentConditionFix.prototype.hasRemoveConflictingComponent = function() {
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.PackValidation.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.PackValidation.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.PackValidation} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.PackValidation.toObject = function(includeInstance, msg) {
  var f, obj = {
    code: jspb.Message.getFieldWithDefault(msg, 1, 0),
    packId: (f = msg.getPackId()) && packsproto_packs_pb.PackId.toObject(includeInstance, f),
    reference: (f = msg.getReference()) && proto.solutions.TrackedPackReference.toObject(includeInstance, f)
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
 * @return {!proto.solutions.PackValidation}
 */
proto.solutions.PackValidation.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.PackValidation;
  return proto.solutions.PackValidation.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.PackValidation} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.PackValidation}
 */
proto.solutions.PackValidation.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!proto.solutions.PackValidation.ResultCode} */ (reader.readEnum());
      msg.setCode(value);
      break;
    case 2:
      var value = new packsproto_packs_pb.PackId;
      reader.readMessage(value,packsproto_packs_pb.PackId.deserializeBinaryFromReader);
      msg.setPackId(value);
      break;
    case 3:
      var value = new proto.solutions.TrackedPackReference;
      reader.readMessage(value,proto.solutions.TrackedPackReference.deserializeBinaryFromReader);
      msg.setReference(value);
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
proto.solutions.PackValidation.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.PackValidation.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.PackValidation} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.PackValidation.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getCode();
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
      packsproto_packs_pb.PackId.serializeBinaryToWriter
    );
  }
  f = message.getReference();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.solutions.TrackedPackReference.serializeBinaryToWriter
    );
  }
};


/**
 * @enum {number}
 */
proto.solutions.PackValidation.ResultCode = {
  PACK_NOT_INSTALLED: 0,
  PACK_FAMILY_UNKNOWN: 1,
  PACK_VERSION_UNKNOWN: 2,
  MANIFEST_ERROR: 3
};

/**
 * optional ResultCode code = 1;
 * @return {!proto.solutions.PackValidation.ResultCode}
 */
proto.solutions.PackValidation.prototype.getCode = function() {
  return /** @type {!proto.solutions.PackValidation.ResultCode} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {!proto.solutions.PackValidation.ResultCode} value
 * @return {!proto.solutions.PackValidation} returns this
 */
proto.solutions.PackValidation.prototype.setCode = function(value) {
  return jspb.Message.setProto3EnumField(this, 1, value);
};


/**
 * optional packs.PackId pack_id = 2;
 * @return {?proto.packs.PackId}
 */
proto.solutions.PackValidation.prototype.getPackId = function() {
  return /** @type{?proto.packs.PackId} */ (
    jspb.Message.getWrapperField(this, packsproto_packs_pb.PackId, 2));
};


/**
 * @param {?proto.packs.PackId|undefined} value
 * @return {!proto.solutions.PackValidation} returns this
*/
proto.solutions.PackValidation.prototype.setPackId = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.PackValidation} returns this
 */
proto.solutions.PackValidation.prototype.clearPackId = function() {
  return this.setPackId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.PackValidation.prototype.hasPackId = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional TrackedPackReference reference = 3;
 * @return {?proto.solutions.TrackedPackReference}
 */
proto.solutions.PackValidation.prototype.getReference = function() {
  return /** @type{?proto.solutions.TrackedPackReference} */ (
    jspb.Message.getWrapperField(this, proto.solutions.TrackedPackReference, 3));
};


/**
 * @param {?proto.solutions.TrackedPackReference|undefined} value
 * @return {!proto.solutions.PackValidation} returns this
*/
proto.solutions.PackValidation.prototype.setReference = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.PackValidation} returns this
 */
proto.solutions.PackValidation.prototype.clearReference = function() {
  return this.setReference(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.PackValidation.prototype.hasReference = function() {
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.ComponentHasUnresolvableDependencies.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.ComponentHasUnresolvableDependencies.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.ComponentHasUnresolvableDependencies} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentHasUnresolvableDependencies.toObject = function(includeInstance, msg) {
  var f, obj = {

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
 * @return {!proto.solutions.ComponentHasUnresolvableDependencies}
 */
proto.solutions.ComponentHasUnresolvableDependencies.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.ComponentHasUnresolvableDependencies;
  return proto.solutions.ComponentHasUnresolvableDependencies.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.ComponentHasUnresolvableDependencies} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.ComponentHasUnresolvableDependencies}
 */
proto.solutions.ComponentHasUnresolvableDependencies.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
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
proto.solutions.ComponentHasUnresolvableDependencies.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.ComponentHasUnresolvableDependencies.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.ComponentHasUnresolvableDependencies} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentHasUnresolvableDependencies.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.ComponentHasDependenciesIncompatibleWithDeviceAndToolchain.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.ComponentHasDependenciesIncompatibleWithDeviceAndToolchain.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.ComponentHasDependenciesIncompatibleWithDeviceAndToolchain} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentHasDependenciesIncompatibleWithDeviceAndToolchain.toObject = function(includeInstance, msg) {
  var f, obj = {

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
 * @return {!proto.solutions.ComponentHasDependenciesIncompatibleWithDeviceAndToolchain}
 */
proto.solutions.ComponentHasDependenciesIncompatibleWithDeviceAndToolchain.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.ComponentHasDependenciesIncompatibleWithDeviceAndToolchain;
  return proto.solutions.ComponentHasDependenciesIncompatibleWithDeviceAndToolchain.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.ComponentHasDependenciesIncompatibleWithDeviceAndToolchain} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.ComponentHasDependenciesIncompatibleWithDeviceAndToolchain}
 */
proto.solutions.ComponentHasDependenciesIncompatibleWithDeviceAndToolchain.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
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
proto.solutions.ComponentHasDependenciesIncompatibleWithDeviceAndToolchain.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.ComponentHasDependenciesIncompatibleWithDeviceAndToolchain.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.ComponentHasDependenciesIncompatibleWithDeviceAndToolchain} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentHasDependenciesIncompatibleWithDeviceAndToolchain.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.HardwareValidation.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.HardwareValidation.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.HardwareValidation} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.HardwareValidation.toObject = function(includeInstance, msg) {
  var f, obj = {
    hardware: (f = msg.getHardware()) && proto.solutions.TrackedHardware.toObject(includeInstance, f),
    projectId: (f = msg.getProjectId()) && proto.solutions.ProjectId.toObject(includeInstance, f),
    buildContext: (f = msg.getBuildContext()) && proto.solutions.BuildContext.toObject(includeInstance, f),
    message: jspb.Message.getFieldWithDefault(msg, 4, ""),
    error: (f = msg.getError()) && proto.solutions.HardwareValidationError.toObject(includeInstance, f)
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
 * @return {!proto.solutions.HardwareValidation}
 */
proto.solutions.HardwareValidation.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.HardwareValidation;
  return proto.solutions.HardwareValidation.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.HardwareValidation} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.HardwareValidation}
 */
proto.solutions.HardwareValidation.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.TrackedHardware;
      reader.readMessage(value,proto.solutions.TrackedHardware.deserializeBinaryFromReader);
      msg.setHardware(value);
      break;
    case 2:
      var value = new proto.solutions.ProjectId;
      reader.readMessage(value,proto.solutions.ProjectId.deserializeBinaryFromReader);
      msg.setProjectId(value);
      break;
    case 3:
      var value = new proto.solutions.BuildContext;
      reader.readMessage(value,proto.solutions.BuildContext.deserializeBinaryFromReader);
      msg.setBuildContext(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setMessage(value);
      break;
    case 5:
      var value = new proto.solutions.HardwareValidationError;
      reader.readMessage(value,proto.solutions.HardwareValidationError.deserializeBinaryFromReader);
      msg.setError(value);
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
proto.solutions.HardwareValidation.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.HardwareValidation.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.HardwareValidation} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.HardwareValidation.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getHardware();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.TrackedHardware.serializeBinaryToWriter
    );
  }
  f = message.getProjectId();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.solutions.ProjectId.serializeBinaryToWriter
    );
  }
  f = message.getBuildContext();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.solutions.BuildContext.serializeBinaryToWriter
    );
  }
  f = message.getMessage();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getError();
  if (f != null) {
    writer.writeMessage(
      5,
      f,
      proto.solutions.HardwareValidationError.serializeBinaryToWriter
    );
  }
};


/**
 * optional TrackedHardware hardware = 1;
 * @return {?proto.solutions.TrackedHardware}
 */
proto.solutions.HardwareValidation.prototype.getHardware = function() {
  return /** @type{?proto.solutions.TrackedHardware} */ (
    jspb.Message.getWrapperField(this, proto.solutions.TrackedHardware, 1));
};


/**
 * @param {?proto.solutions.TrackedHardware|undefined} value
 * @return {!proto.solutions.HardwareValidation} returns this
*/
proto.solutions.HardwareValidation.prototype.setHardware = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.HardwareValidation} returns this
 */
proto.solutions.HardwareValidation.prototype.clearHardware = function() {
  return this.setHardware(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.HardwareValidation.prototype.hasHardware = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional ProjectId project_id = 2;
 * @return {?proto.solutions.ProjectId}
 */
proto.solutions.HardwareValidation.prototype.getProjectId = function() {
  return /** @type{?proto.solutions.ProjectId} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ProjectId, 2));
};


/**
 * @param {?proto.solutions.ProjectId|undefined} value
 * @return {!proto.solutions.HardwareValidation} returns this
*/
proto.solutions.HardwareValidation.prototype.setProjectId = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.HardwareValidation} returns this
 */
proto.solutions.HardwareValidation.prototype.clearProjectId = function() {
  return this.setProjectId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.HardwareValidation.prototype.hasProjectId = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional BuildContext build_context = 3;
 * @return {?proto.solutions.BuildContext}
 */
proto.solutions.HardwareValidation.prototype.getBuildContext = function() {
  return /** @type{?proto.solutions.BuildContext} */ (
    jspb.Message.getWrapperField(this, proto.solutions.BuildContext, 3));
};


/**
 * @param {?proto.solutions.BuildContext|undefined} value
 * @return {!proto.solutions.HardwareValidation} returns this
*/
proto.solutions.HardwareValidation.prototype.setBuildContext = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.HardwareValidation} returns this
 */
proto.solutions.HardwareValidation.prototype.clearBuildContext = function() {
  return this.setBuildContext(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.HardwareValidation.prototype.hasBuildContext = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional string message = 4;
 * @return {string}
 */
proto.solutions.HardwareValidation.prototype.getMessage = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.HardwareValidation} returns this
 */
proto.solutions.HardwareValidation.prototype.setMessage = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional HardwareValidationError error = 5;
 * @return {?proto.solutions.HardwareValidationError}
 */
proto.solutions.HardwareValidation.prototype.getError = function() {
  return /** @type{?proto.solutions.HardwareValidationError} */ (
    jspb.Message.getWrapperField(this, proto.solutions.HardwareValidationError, 5));
};


/**
 * @param {?proto.solutions.HardwareValidationError|undefined} value
 * @return {!proto.solutions.HardwareValidation} returns this
*/
proto.solutions.HardwareValidation.prototype.setError = function(value) {
  return jspb.Message.setWrapperField(this, 5, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.HardwareValidation} returns this
 */
proto.solutions.HardwareValidation.prototype.clearError = function() {
  return this.setError(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.HardwareValidation.prototype.hasError = function() {
  return jspb.Message.getField(this, 5) != null;
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.TrackedHardware.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.TrackedHardware.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.TrackedHardware} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.TrackedHardware.toObject = function(includeInstance, msg) {
  var f, obj = {
    boardVendor: (f = msg.getBoardVendor()) && proto.solutions.TrackedElement.toObject(includeInstance, f),
    boardName: (f = msg.getBoardName()) && proto.solutions.TrackedElement.toObject(includeInstance, f),
    boardRevision: (f = msg.getBoardRevision()) && proto.solutions.TrackedElement.toObject(includeInstance, f),
    deviceVendor: (f = msg.getDeviceVendor()) && proto.solutions.TrackedElement.toObject(includeInstance, f),
    deviceName: (f = msg.getDeviceName()) && proto.solutions.TrackedElement.toObject(includeInstance, f),
    deviceProcessor: (f = msg.getDeviceProcessor()) && proto.solutions.TrackedElement.toObject(includeInstance, f)
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
 * @return {!proto.solutions.TrackedHardware}
 */
proto.solutions.TrackedHardware.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.TrackedHardware;
  return proto.solutions.TrackedHardware.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.TrackedHardware} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.TrackedHardware}
 */
proto.solutions.TrackedHardware.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.TrackedElement;
      reader.readMessage(value,proto.solutions.TrackedElement.deserializeBinaryFromReader);
      msg.setBoardVendor(value);
      break;
    case 2:
      var value = new proto.solutions.TrackedElement;
      reader.readMessage(value,proto.solutions.TrackedElement.deserializeBinaryFromReader);
      msg.setBoardName(value);
      break;
    case 3:
      var value = new proto.solutions.TrackedElement;
      reader.readMessage(value,proto.solutions.TrackedElement.deserializeBinaryFromReader);
      msg.setBoardRevision(value);
      break;
    case 4:
      var value = new proto.solutions.TrackedElement;
      reader.readMessage(value,proto.solutions.TrackedElement.deserializeBinaryFromReader);
      msg.setDeviceVendor(value);
      break;
    case 5:
      var value = new proto.solutions.TrackedElement;
      reader.readMessage(value,proto.solutions.TrackedElement.deserializeBinaryFromReader);
      msg.setDeviceName(value);
      break;
    case 6:
      var value = new proto.solutions.TrackedElement;
      reader.readMessage(value,proto.solutions.TrackedElement.deserializeBinaryFromReader);
      msg.setDeviceProcessor(value);
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
proto.solutions.TrackedHardware.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.TrackedHardware.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.TrackedHardware} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.TrackedHardware.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBoardVendor();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.TrackedElement.serializeBinaryToWriter
    );
  }
  f = message.getBoardName();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.solutions.TrackedElement.serializeBinaryToWriter
    );
  }
  f = message.getBoardRevision();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.solutions.TrackedElement.serializeBinaryToWriter
    );
  }
  f = message.getDeviceVendor();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.solutions.TrackedElement.serializeBinaryToWriter
    );
  }
  f = message.getDeviceName();
  if (f != null) {
    writer.writeMessage(
      5,
      f,
      proto.solutions.TrackedElement.serializeBinaryToWriter
    );
  }
  f = message.getDeviceProcessor();
  if (f != null) {
    writer.writeMessage(
      6,
      f,
      proto.solutions.TrackedElement.serializeBinaryToWriter
    );
  }
};


/**
 * optional TrackedElement board_vendor = 1;
 * @return {?proto.solutions.TrackedElement}
 */
proto.solutions.TrackedHardware.prototype.getBoardVendor = function() {
  return /** @type{?proto.solutions.TrackedElement} */ (
    jspb.Message.getWrapperField(this, proto.solutions.TrackedElement, 1));
};


/**
 * @param {?proto.solutions.TrackedElement|undefined} value
 * @return {!proto.solutions.TrackedHardware} returns this
*/
proto.solutions.TrackedHardware.prototype.setBoardVendor = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.TrackedHardware} returns this
 */
proto.solutions.TrackedHardware.prototype.clearBoardVendor = function() {
  return this.setBoardVendor(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.TrackedHardware.prototype.hasBoardVendor = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional TrackedElement board_name = 2;
 * @return {?proto.solutions.TrackedElement}
 */
proto.solutions.TrackedHardware.prototype.getBoardName = function() {
  return /** @type{?proto.solutions.TrackedElement} */ (
    jspb.Message.getWrapperField(this, proto.solutions.TrackedElement, 2));
};


/**
 * @param {?proto.solutions.TrackedElement|undefined} value
 * @return {!proto.solutions.TrackedHardware} returns this
*/
proto.solutions.TrackedHardware.prototype.setBoardName = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.TrackedHardware} returns this
 */
proto.solutions.TrackedHardware.prototype.clearBoardName = function() {
  return this.setBoardName(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.TrackedHardware.prototype.hasBoardName = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional TrackedElement board_revision = 3;
 * @return {?proto.solutions.TrackedElement}
 */
proto.solutions.TrackedHardware.prototype.getBoardRevision = function() {
  return /** @type{?proto.solutions.TrackedElement} */ (
    jspb.Message.getWrapperField(this, proto.solutions.TrackedElement, 3));
};


/**
 * @param {?proto.solutions.TrackedElement|undefined} value
 * @return {!proto.solutions.TrackedHardware} returns this
*/
proto.solutions.TrackedHardware.prototype.setBoardRevision = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.TrackedHardware} returns this
 */
proto.solutions.TrackedHardware.prototype.clearBoardRevision = function() {
  return this.setBoardRevision(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.TrackedHardware.prototype.hasBoardRevision = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional TrackedElement device_vendor = 4;
 * @return {?proto.solutions.TrackedElement}
 */
proto.solutions.TrackedHardware.prototype.getDeviceVendor = function() {
  return /** @type{?proto.solutions.TrackedElement} */ (
    jspb.Message.getWrapperField(this, proto.solutions.TrackedElement, 4));
};


/**
 * @param {?proto.solutions.TrackedElement|undefined} value
 * @return {!proto.solutions.TrackedHardware} returns this
*/
proto.solutions.TrackedHardware.prototype.setDeviceVendor = function(value) {
  return jspb.Message.setWrapperField(this, 4, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.TrackedHardware} returns this
 */
proto.solutions.TrackedHardware.prototype.clearDeviceVendor = function() {
  return this.setDeviceVendor(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.TrackedHardware.prototype.hasDeviceVendor = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional TrackedElement device_name = 5;
 * @return {?proto.solutions.TrackedElement}
 */
proto.solutions.TrackedHardware.prototype.getDeviceName = function() {
  return /** @type{?proto.solutions.TrackedElement} */ (
    jspb.Message.getWrapperField(this, proto.solutions.TrackedElement, 5));
};


/**
 * @param {?proto.solutions.TrackedElement|undefined} value
 * @return {!proto.solutions.TrackedHardware} returns this
*/
proto.solutions.TrackedHardware.prototype.setDeviceName = function(value) {
  return jspb.Message.setWrapperField(this, 5, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.TrackedHardware} returns this
 */
proto.solutions.TrackedHardware.prototype.clearDeviceName = function() {
  return this.setDeviceName(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.TrackedHardware.prototype.hasDeviceName = function() {
  return jspb.Message.getField(this, 5) != null;
};


/**
 * optional TrackedElement device_processor = 6;
 * @return {?proto.solutions.TrackedElement}
 */
proto.solutions.TrackedHardware.prototype.getDeviceProcessor = function() {
  return /** @type{?proto.solutions.TrackedElement} */ (
    jspb.Message.getWrapperField(this, proto.solutions.TrackedElement, 6));
};


/**
 * @param {?proto.solutions.TrackedElement|undefined} value
 * @return {!proto.solutions.TrackedHardware} returns this
*/
proto.solutions.TrackedHardware.prototype.setDeviceProcessor = function(value) {
  return jspb.Message.setWrapperField(this, 6, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.TrackedHardware} returns this
 */
proto.solutions.TrackedHardware.prototype.clearDeviceProcessor = function() {
  return this.setDeviceProcessor(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.TrackedHardware.prototype.hasDeviceProcessor = function() {
  return jspb.Message.getField(this, 6) != null;
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.TrackedElement.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.TrackedElement.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.TrackedElement} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.TrackedElement.toObject = function(includeInstance, msg) {
  var f, obj = {
    value: jspb.Message.getFieldWithDefault(msg, 1, ""),
    origin: (f = msg.getOrigin()) && proto.solutions.HardwareOrigin.toObject(includeInstance, f)
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
 * @return {!proto.solutions.TrackedElement}
 */
proto.solutions.TrackedElement.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.TrackedElement;
  return proto.solutions.TrackedElement.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.TrackedElement} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.TrackedElement}
 */
proto.solutions.TrackedElement.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setValue(value);
      break;
    case 2:
      var value = new proto.solutions.HardwareOrigin;
      reader.readMessage(value,proto.solutions.HardwareOrigin.deserializeBinaryFromReader);
      msg.setOrigin(value);
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
proto.solutions.TrackedElement.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.TrackedElement.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.TrackedElement} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.TrackedElement.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getValue();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getOrigin();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.solutions.HardwareOrigin.serializeBinaryToWriter
    );
  }
};


/**
 * optional string value = 1;
 * @return {string}
 */
proto.solutions.TrackedElement.prototype.getValue = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.TrackedElement} returns this
 */
proto.solutions.TrackedElement.prototype.setValue = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional HardwareOrigin origin = 2;
 * @return {?proto.solutions.HardwareOrigin}
 */
proto.solutions.TrackedElement.prototype.getOrigin = function() {
  return /** @type{?proto.solutions.HardwareOrigin} */ (
    jspb.Message.getWrapperField(this, proto.solutions.HardwareOrigin, 2));
};


/**
 * @param {?proto.solutions.HardwareOrigin|undefined} value
 * @return {!proto.solutions.TrackedElement} returns this
*/
proto.solutions.TrackedElement.prototype.setOrigin = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.TrackedElement} returns this
 */
proto.solutions.TrackedElement.prototype.clearOrigin = function() {
  return this.setOrigin(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.TrackedElement.prototype.hasOrigin = function() {
  return jspb.Message.getField(this, 2) != null;
};



/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.solutions.HardwareOrigin.oneofGroups_ = [[1,2,3]];

/**
 * @enum {number}
 */
proto.solutions.HardwareOrigin.OriginCase = {
  ORIGIN_NOT_SET: 0,
  TARGET_TYPE_ID: 1,
  PROJECT_ID: 2,
  LAYER_ID: 3
};

/**
 * @return {proto.solutions.HardwareOrigin.OriginCase}
 */
proto.solutions.HardwareOrigin.prototype.getOriginCase = function() {
  return /** @type {proto.solutions.HardwareOrigin.OriginCase} */(jspb.Message.computeOneofCase(this, proto.solutions.HardwareOrigin.oneofGroups_[0]));
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.HardwareOrigin.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.HardwareOrigin.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.HardwareOrigin} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.HardwareOrigin.toObject = function(includeInstance, msg) {
  var f, obj = {
    targetTypeId: (f = msg.getTargetTypeId()) && proto.solutions.TargetTypeId.toObject(includeInstance, f),
    projectId: (f = msg.getProjectId()) && proto.solutions.ProjectId.toObject(includeInstance, f),
    layerId: (f = msg.getLayerId()) && proto.solutions.LayerId.toObject(includeInstance, f)
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
 * @return {!proto.solutions.HardwareOrigin}
 */
proto.solutions.HardwareOrigin.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.HardwareOrigin;
  return proto.solutions.HardwareOrigin.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.HardwareOrigin} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.HardwareOrigin}
 */
proto.solutions.HardwareOrigin.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.TargetTypeId;
      reader.readMessage(value,proto.solutions.TargetTypeId.deserializeBinaryFromReader);
      msg.setTargetTypeId(value);
      break;
    case 2:
      var value = new proto.solutions.ProjectId;
      reader.readMessage(value,proto.solutions.ProjectId.deserializeBinaryFromReader);
      msg.setProjectId(value);
      break;
    case 3:
      var value = new proto.solutions.LayerId;
      reader.readMessage(value,proto.solutions.LayerId.deserializeBinaryFromReader);
      msg.setLayerId(value);
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
proto.solutions.HardwareOrigin.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.HardwareOrigin.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.HardwareOrigin} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.HardwareOrigin.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTargetTypeId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.TargetTypeId.serializeBinaryToWriter
    );
  }
  f = message.getProjectId();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.solutions.ProjectId.serializeBinaryToWriter
    );
  }
  f = message.getLayerId();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.solutions.LayerId.serializeBinaryToWriter
    );
  }
};


/**
 * optional TargetTypeId target_type_id = 1;
 * @return {?proto.solutions.TargetTypeId}
 */
proto.solutions.HardwareOrigin.prototype.getTargetTypeId = function() {
  return /** @type{?proto.solutions.TargetTypeId} */ (
    jspb.Message.getWrapperField(this, proto.solutions.TargetTypeId, 1));
};


/**
 * @param {?proto.solutions.TargetTypeId|undefined} value
 * @return {!proto.solutions.HardwareOrigin} returns this
*/
proto.solutions.HardwareOrigin.prototype.setTargetTypeId = function(value) {
  return jspb.Message.setOneofWrapperField(this, 1, proto.solutions.HardwareOrigin.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.HardwareOrigin} returns this
 */
proto.solutions.HardwareOrigin.prototype.clearTargetTypeId = function() {
  return this.setTargetTypeId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.HardwareOrigin.prototype.hasTargetTypeId = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional ProjectId project_id = 2;
 * @return {?proto.solutions.ProjectId}
 */
proto.solutions.HardwareOrigin.prototype.getProjectId = function() {
  return /** @type{?proto.solutions.ProjectId} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ProjectId, 2));
};


/**
 * @param {?proto.solutions.ProjectId|undefined} value
 * @return {!proto.solutions.HardwareOrigin} returns this
*/
proto.solutions.HardwareOrigin.prototype.setProjectId = function(value) {
  return jspb.Message.setOneofWrapperField(this, 2, proto.solutions.HardwareOrigin.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.HardwareOrigin} returns this
 */
proto.solutions.HardwareOrigin.prototype.clearProjectId = function() {
  return this.setProjectId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.HardwareOrigin.prototype.hasProjectId = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional LayerId layer_id = 3;
 * @return {?proto.solutions.LayerId}
 */
proto.solutions.HardwareOrigin.prototype.getLayerId = function() {
  return /** @type{?proto.solutions.LayerId} */ (
    jspb.Message.getWrapperField(this, proto.solutions.LayerId, 3));
};


/**
 * @param {?proto.solutions.LayerId|undefined} value
 * @return {!proto.solutions.HardwareOrigin} returns this
*/
proto.solutions.HardwareOrigin.prototype.setLayerId = function(value) {
  return jspb.Message.setOneofWrapperField(this, 3, proto.solutions.HardwareOrigin.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.HardwareOrigin} returns this
 */
proto.solutions.HardwareOrigin.prototype.clearLayerId = function() {
  return this.setLayerId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.HardwareOrigin.prototype.hasLayerId = function() {
  return jspb.Message.getField(this, 3) != null;
};



/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.solutions.HardwareValidationError.oneofGroups_ = [[1,2,3,4,5,6,7]];

/**
 * @enum {number}
 */
proto.solutions.HardwareValidationError.ErrorTypeCase = {
  ERROR_TYPE_NOT_SET: 0,
  BOARD_NOT_FOUND: 1,
  MANY_BOARDS_FOUND: 2,
  UNABLE_TO_RESOLVE_DEVICE_ON_MATCHING_BOARDS: 3,
  UNABLE_TO_RESOLVE_DEVICE_ON_BOARD: 4,
  DEVICE_NOT_FOUND: 5,
  PROCESSOR_NOT_FOUND_ON_DEVICE: 6,
  PROCESSOR_MUST_BE_SPECIFIED: 7
};

/**
 * @return {proto.solutions.HardwareValidationError.ErrorTypeCase}
 */
proto.solutions.HardwareValidationError.prototype.getErrorTypeCase = function() {
  return /** @type {proto.solutions.HardwareValidationError.ErrorTypeCase} */(jspb.Message.computeOneofCase(this, proto.solutions.HardwareValidationError.oneofGroups_[0]));
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.HardwareValidationError.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.HardwareValidationError.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.HardwareValidationError} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.HardwareValidationError.toObject = function(includeInstance, msg) {
  var f, obj = {
    boardNotFound: (f = msg.getBoardNotFound()) && proto.solutions.BoardNotFound.toObject(includeInstance, f),
    manyBoardsFound: (f = msg.getManyBoardsFound()) && proto.solutions.ManyBoardsFound.toObject(includeInstance, f),
    unableToResolveDeviceOnMatchingBoards: (f = msg.getUnableToResolveDeviceOnMatchingBoards()) && proto.solutions.UnableToResolveDeviceOnMatchingBoards.toObject(includeInstance, f),
    unableToResolveDeviceOnBoard: (f = msg.getUnableToResolveDeviceOnBoard()) && proto.solutions.UnableToResolveDeviceOnBoard.toObject(includeInstance, f),
    deviceNotFound: (f = msg.getDeviceNotFound()) && proto.solutions.DeviceNotFound.toObject(includeInstance, f),
    processorNotFoundOnDevice: (f = msg.getProcessorNotFoundOnDevice()) && proto.solutions.ProcessorNotFoundOnDevice.toObject(includeInstance, f),
    processorMustBeSpecified: (f = msg.getProcessorMustBeSpecified()) && proto.solutions.ProcessorMustBeSpecified.toObject(includeInstance, f)
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
 * @return {!proto.solutions.HardwareValidationError}
 */
proto.solutions.HardwareValidationError.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.HardwareValidationError;
  return proto.solutions.HardwareValidationError.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.HardwareValidationError} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.HardwareValidationError}
 */
proto.solutions.HardwareValidationError.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.BoardNotFound;
      reader.readMessage(value,proto.solutions.BoardNotFound.deserializeBinaryFromReader);
      msg.setBoardNotFound(value);
      break;
    case 2:
      var value = new proto.solutions.ManyBoardsFound;
      reader.readMessage(value,proto.solutions.ManyBoardsFound.deserializeBinaryFromReader);
      msg.setManyBoardsFound(value);
      break;
    case 3:
      var value = new proto.solutions.UnableToResolveDeviceOnMatchingBoards;
      reader.readMessage(value,proto.solutions.UnableToResolveDeviceOnMatchingBoards.deserializeBinaryFromReader);
      msg.setUnableToResolveDeviceOnMatchingBoards(value);
      break;
    case 4:
      var value = new proto.solutions.UnableToResolveDeviceOnBoard;
      reader.readMessage(value,proto.solutions.UnableToResolveDeviceOnBoard.deserializeBinaryFromReader);
      msg.setUnableToResolveDeviceOnBoard(value);
      break;
    case 5:
      var value = new proto.solutions.DeviceNotFound;
      reader.readMessage(value,proto.solutions.DeviceNotFound.deserializeBinaryFromReader);
      msg.setDeviceNotFound(value);
      break;
    case 6:
      var value = new proto.solutions.ProcessorNotFoundOnDevice;
      reader.readMessage(value,proto.solutions.ProcessorNotFoundOnDevice.deserializeBinaryFromReader);
      msg.setProcessorNotFoundOnDevice(value);
      break;
    case 7:
      var value = new proto.solutions.ProcessorMustBeSpecified;
      reader.readMessage(value,proto.solutions.ProcessorMustBeSpecified.deserializeBinaryFromReader);
      msg.setProcessorMustBeSpecified(value);
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
proto.solutions.HardwareValidationError.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.HardwareValidationError.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.HardwareValidationError} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.HardwareValidationError.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBoardNotFound();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.BoardNotFound.serializeBinaryToWriter
    );
  }
  f = message.getManyBoardsFound();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.solutions.ManyBoardsFound.serializeBinaryToWriter
    );
  }
  f = message.getUnableToResolveDeviceOnMatchingBoards();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.solutions.UnableToResolveDeviceOnMatchingBoards.serializeBinaryToWriter
    );
  }
  f = message.getUnableToResolveDeviceOnBoard();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.solutions.UnableToResolveDeviceOnBoard.serializeBinaryToWriter
    );
  }
  f = message.getDeviceNotFound();
  if (f != null) {
    writer.writeMessage(
      5,
      f,
      proto.solutions.DeviceNotFound.serializeBinaryToWriter
    );
  }
  f = message.getProcessorNotFoundOnDevice();
  if (f != null) {
    writer.writeMessage(
      6,
      f,
      proto.solutions.ProcessorNotFoundOnDevice.serializeBinaryToWriter
    );
  }
  f = message.getProcessorMustBeSpecified();
  if (f != null) {
    writer.writeMessage(
      7,
      f,
      proto.solutions.ProcessorMustBeSpecified.serializeBinaryToWriter
    );
  }
};


/**
 * optional BoardNotFound board_not_found = 1;
 * @return {?proto.solutions.BoardNotFound}
 */
proto.solutions.HardwareValidationError.prototype.getBoardNotFound = function() {
  return /** @type{?proto.solutions.BoardNotFound} */ (
    jspb.Message.getWrapperField(this, proto.solutions.BoardNotFound, 1));
};


/**
 * @param {?proto.solutions.BoardNotFound|undefined} value
 * @return {!proto.solutions.HardwareValidationError} returns this
*/
proto.solutions.HardwareValidationError.prototype.setBoardNotFound = function(value) {
  return jspb.Message.setOneofWrapperField(this, 1, proto.solutions.HardwareValidationError.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.HardwareValidationError} returns this
 */
proto.solutions.HardwareValidationError.prototype.clearBoardNotFound = function() {
  return this.setBoardNotFound(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.HardwareValidationError.prototype.hasBoardNotFound = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional ManyBoardsFound many_boards_found = 2;
 * @return {?proto.solutions.ManyBoardsFound}
 */
proto.solutions.HardwareValidationError.prototype.getManyBoardsFound = function() {
  return /** @type{?proto.solutions.ManyBoardsFound} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ManyBoardsFound, 2));
};


/**
 * @param {?proto.solutions.ManyBoardsFound|undefined} value
 * @return {!proto.solutions.HardwareValidationError} returns this
*/
proto.solutions.HardwareValidationError.prototype.setManyBoardsFound = function(value) {
  return jspb.Message.setOneofWrapperField(this, 2, proto.solutions.HardwareValidationError.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.HardwareValidationError} returns this
 */
proto.solutions.HardwareValidationError.prototype.clearManyBoardsFound = function() {
  return this.setManyBoardsFound(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.HardwareValidationError.prototype.hasManyBoardsFound = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional UnableToResolveDeviceOnMatchingBoards unable_to_resolve_device_on_matching_boards = 3;
 * @return {?proto.solutions.UnableToResolveDeviceOnMatchingBoards}
 */
proto.solutions.HardwareValidationError.prototype.getUnableToResolveDeviceOnMatchingBoards = function() {
  return /** @type{?proto.solutions.UnableToResolveDeviceOnMatchingBoards} */ (
    jspb.Message.getWrapperField(this, proto.solutions.UnableToResolveDeviceOnMatchingBoards, 3));
};


/**
 * @param {?proto.solutions.UnableToResolveDeviceOnMatchingBoards|undefined} value
 * @return {!proto.solutions.HardwareValidationError} returns this
*/
proto.solutions.HardwareValidationError.prototype.setUnableToResolveDeviceOnMatchingBoards = function(value) {
  return jspb.Message.setOneofWrapperField(this, 3, proto.solutions.HardwareValidationError.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.HardwareValidationError} returns this
 */
proto.solutions.HardwareValidationError.prototype.clearUnableToResolveDeviceOnMatchingBoards = function() {
  return this.setUnableToResolveDeviceOnMatchingBoards(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.HardwareValidationError.prototype.hasUnableToResolveDeviceOnMatchingBoards = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional UnableToResolveDeviceOnBoard unable_to_resolve_device_on_board = 4;
 * @return {?proto.solutions.UnableToResolveDeviceOnBoard}
 */
proto.solutions.HardwareValidationError.prototype.getUnableToResolveDeviceOnBoard = function() {
  return /** @type{?proto.solutions.UnableToResolveDeviceOnBoard} */ (
    jspb.Message.getWrapperField(this, proto.solutions.UnableToResolveDeviceOnBoard, 4));
};


/**
 * @param {?proto.solutions.UnableToResolveDeviceOnBoard|undefined} value
 * @return {!proto.solutions.HardwareValidationError} returns this
*/
proto.solutions.HardwareValidationError.prototype.setUnableToResolveDeviceOnBoard = function(value) {
  return jspb.Message.setOneofWrapperField(this, 4, proto.solutions.HardwareValidationError.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.HardwareValidationError} returns this
 */
proto.solutions.HardwareValidationError.prototype.clearUnableToResolveDeviceOnBoard = function() {
  return this.setUnableToResolveDeviceOnBoard(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.HardwareValidationError.prototype.hasUnableToResolveDeviceOnBoard = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional DeviceNotFound device_not_found = 5;
 * @return {?proto.solutions.DeviceNotFound}
 */
proto.solutions.HardwareValidationError.prototype.getDeviceNotFound = function() {
  return /** @type{?proto.solutions.DeviceNotFound} */ (
    jspb.Message.getWrapperField(this, proto.solutions.DeviceNotFound, 5));
};


/**
 * @param {?proto.solutions.DeviceNotFound|undefined} value
 * @return {!proto.solutions.HardwareValidationError} returns this
*/
proto.solutions.HardwareValidationError.prototype.setDeviceNotFound = function(value) {
  return jspb.Message.setOneofWrapperField(this, 5, proto.solutions.HardwareValidationError.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.HardwareValidationError} returns this
 */
proto.solutions.HardwareValidationError.prototype.clearDeviceNotFound = function() {
  return this.setDeviceNotFound(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.HardwareValidationError.prototype.hasDeviceNotFound = function() {
  return jspb.Message.getField(this, 5) != null;
};


/**
 * optional ProcessorNotFoundOnDevice processor_not_found_on_device = 6;
 * @return {?proto.solutions.ProcessorNotFoundOnDevice}
 */
proto.solutions.HardwareValidationError.prototype.getProcessorNotFoundOnDevice = function() {
  return /** @type{?proto.solutions.ProcessorNotFoundOnDevice} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ProcessorNotFoundOnDevice, 6));
};


/**
 * @param {?proto.solutions.ProcessorNotFoundOnDevice|undefined} value
 * @return {!proto.solutions.HardwareValidationError} returns this
*/
proto.solutions.HardwareValidationError.prototype.setProcessorNotFoundOnDevice = function(value) {
  return jspb.Message.setOneofWrapperField(this, 6, proto.solutions.HardwareValidationError.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.HardwareValidationError} returns this
 */
proto.solutions.HardwareValidationError.prototype.clearProcessorNotFoundOnDevice = function() {
  return this.setProcessorNotFoundOnDevice(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.HardwareValidationError.prototype.hasProcessorNotFoundOnDevice = function() {
  return jspb.Message.getField(this, 6) != null;
};


/**
 * optional ProcessorMustBeSpecified processor_must_be_specified = 7;
 * @return {?proto.solutions.ProcessorMustBeSpecified}
 */
proto.solutions.HardwareValidationError.prototype.getProcessorMustBeSpecified = function() {
  return /** @type{?proto.solutions.ProcessorMustBeSpecified} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ProcessorMustBeSpecified, 7));
};


/**
 * @param {?proto.solutions.ProcessorMustBeSpecified|undefined} value
 * @return {!proto.solutions.HardwareValidationError} returns this
*/
proto.solutions.HardwareValidationError.prototype.setProcessorMustBeSpecified = function(value) {
  return jspb.Message.setOneofWrapperField(this, 7, proto.solutions.HardwareValidationError.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.HardwareValidationError} returns this
 */
proto.solutions.HardwareValidationError.prototype.clearProcessorMustBeSpecified = function() {
  return this.setProcessorMustBeSpecified(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.HardwareValidationError.prototype.hasProcessorMustBeSpecified = function() {
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.BoardNotFound.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.BoardNotFound.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.BoardNotFound} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.BoardNotFound.toObject = function(includeInstance, msg) {
  var f, obj = {
    boardConstraints: (f = msg.getBoardConstraints()) && proto.solutions.BoardConstraints.toObject(includeInstance, f),
    packScope: (f = msg.getPackScope()) && proto.solutions.PackScope.toObject(includeInstance, f)
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
 * @return {!proto.solutions.BoardNotFound}
 */
proto.solutions.BoardNotFound.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.BoardNotFound;
  return proto.solutions.BoardNotFound.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.BoardNotFound} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.BoardNotFound}
 */
proto.solutions.BoardNotFound.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.BoardConstraints;
      reader.readMessage(value,proto.solutions.BoardConstraints.deserializeBinaryFromReader);
      msg.setBoardConstraints(value);
      break;
    case 2:
      var value = new proto.solutions.PackScope;
      reader.readMessage(value,proto.solutions.PackScope.deserializeBinaryFromReader);
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
proto.solutions.BoardNotFound.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.BoardNotFound.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.BoardNotFound} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.BoardNotFound.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBoardConstraints();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.BoardConstraints.serializeBinaryToWriter
    );
  }
  f = message.getPackScope();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.solutions.PackScope.serializeBinaryToWriter
    );
  }
};


/**
 * optional BoardConstraints board_constraints = 1;
 * @return {?proto.solutions.BoardConstraints}
 */
proto.solutions.BoardNotFound.prototype.getBoardConstraints = function() {
  return /** @type{?proto.solutions.BoardConstraints} */ (
    jspb.Message.getWrapperField(this, proto.solutions.BoardConstraints, 1));
};


/**
 * @param {?proto.solutions.BoardConstraints|undefined} value
 * @return {!proto.solutions.BoardNotFound} returns this
*/
proto.solutions.BoardNotFound.prototype.setBoardConstraints = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.BoardNotFound} returns this
 */
proto.solutions.BoardNotFound.prototype.clearBoardConstraints = function() {
  return this.setBoardConstraints(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.BoardNotFound.prototype.hasBoardConstraints = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional PackScope pack_scope = 2;
 * @return {?proto.solutions.PackScope}
 */
proto.solutions.BoardNotFound.prototype.getPackScope = function() {
  return /** @type{?proto.solutions.PackScope} */ (
    jspb.Message.getWrapperField(this, proto.solutions.PackScope, 2));
};


/**
 * @param {?proto.solutions.PackScope|undefined} value
 * @return {!proto.solutions.BoardNotFound} returns this
*/
proto.solutions.BoardNotFound.prototype.setPackScope = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.BoardNotFound} returns this
 */
proto.solutions.BoardNotFound.prototype.clearPackScope = function() {
  return this.setPackScope(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.BoardNotFound.prototype.hasPackScope = function() {
  return jspb.Message.getField(this, 2) != null;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.solutions.ManyBoardsFound.repeatedFields_ = [3];



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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.ManyBoardsFound.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.ManyBoardsFound.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.ManyBoardsFound} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ManyBoardsFound.toObject = function(includeInstance, msg) {
  var f, obj = {
    boardConstraints: (f = msg.getBoardConstraints()) && proto.solutions.BoardConstraints.toObject(includeInstance, f),
    packScope: (f = msg.getPackScope()) && proto.solutions.PackScope.toObject(includeInstance, f),
    boardsList: jspb.Message.toObjectList(msg.getBoardsList(),
    packsproto_packs_pb.BoardId.toObject, includeInstance)
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
 * @return {!proto.solutions.ManyBoardsFound}
 */
proto.solutions.ManyBoardsFound.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.ManyBoardsFound;
  return proto.solutions.ManyBoardsFound.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.ManyBoardsFound} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.ManyBoardsFound}
 */
proto.solutions.ManyBoardsFound.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.BoardConstraints;
      reader.readMessage(value,proto.solutions.BoardConstraints.deserializeBinaryFromReader);
      msg.setBoardConstraints(value);
      break;
    case 2:
      var value = new proto.solutions.PackScope;
      reader.readMessage(value,proto.solutions.PackScope.deserializeBinaryFromReader);
      msg.setPackScope(value);
      break;
    case 3:
      var value = new packsproto_packs_pb.BoardId;
      reader.readMessage(value,packsproto_packs_pb.BoardId.deserializeBinaryFromReader);
      msg.addBoards(value);
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
proto.solutions.ManyBoardsFound.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.ManyBoardsFound.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.ManyBoardsFound} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ManyBoardsFound.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBoardConstraints();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.BoardConstraints.serializeBinaryToWriter
    );
  }
  f = message.getPackScope();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.solutions.PackScope.serializeBinaryToWriter
    );
  }
  f = message.getBoardsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      packsproto_packs_pb.BoardId.serializeBinaryToWriter
    );
  }
};


/**
 * optional BoardConstraints board_constraints = 1;
 * @return {?proto.solutions.BoardConstraints}
 */
proto.solutions.ManyBoardsFound.prototype.getBoardConstraints = function() {
  return /** @type{?proto.solutions.BoardConstraints} */ (
    jspb.Message.getWrapperField(this, proto.solutions.BoardConstraints, 1));
};


/**
 * @param {?proto.solutions.BoardConstraints|undefined} value
 * @return {!proto.solutions.ManyBoardsFound} returns this
*/
proto.solutions.ManyBoardsFound.prototype.setBoardConstraints = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ManyBoardsFound} returns this
 */
proto.solutions.ManyBoardsFound.prototype.clearBoardConstraints = function() {
  return this.setBoardConstraints(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ManyBoardsFound.prototype.hasBoardConstraints = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional PackScope pack_scope = 2;
 * @return {?proto.solutions.PackScope}
 */
proto.solutions.ManyBoardsFound.prototype.getPackScope = function() {
  return /** @type{?proto.solutions.PackScope} */ (
    jspb.Message.getWrapperField(this, proto.solutions.PackScope, 2));
};


/**
 * @param {?proto.solutions.PackScope|undefined} value
 * @return {!proto.solutions.ManyBoardsFound} returns this
*/
proto.solutions.ManyBoardsFound.prototype.setPackScope = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ManyBoardsFound} returns this
 */
proto.solutions.ManyBoardsFound.prototype.clearPackScope = function() {
  return this.setPackScope(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ManyBoardsFound.prototype.hasPackScope = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * repeated packs.BoardId boards = 3;
 * @return {!Array<!proto.packs.BoardId>}
 */
proto.solutions.ManyBoardsFound.prototype.getBoardsList = function() {
  return /** @type{!Array<!proto.packs.BoardId>} */ (
    jspb.Message.getRepeatedWrapperField(this, packsproto_packs_pb.BoardId, 3));
};


/**
 * @param {!Array<!proto.packs.BoardId>} value
 * @return {!proto.solutions.ManyBoardsFound} returns this
*/
proto.solutions.ManyBoardsFound.prototype.setBoardsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.packs.BoardId=} opt_value
 * @param {number=} opt_index
 * @return {!proto.packs.BoardId}
 */
proto.solutions.ManyBoardsFound.prototype.addBoards = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.packs.BoardId, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.ManyBoardsFound} returns this
 */
proto.solutions.ManyBoardsFound.prototype.clearBoardsList = function() {
  return this.setBoardsList([]);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.solutions.UnableToResolveDeviceOnMatchingBoards.repeatedFields_ = [4];



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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.UnableToResolveDeviceOnMatchingBoards.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.UnableToResolveDeviceOnMatchingBoards.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.UnableToResolveDeviceOnMatchingBoards} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.UnableToResolveDeviceOnMatchingBoards.toObject = function(includeInstance, msg) {
  var f, obj = {
    boardConstraints: (f = msg.getBoardConstraints()) && proto.solutions.BoardConstraints.toObject(includeInstance, f),
    deviceConstraints: (f = msg.getDeviceConstraints()) && proto.solutions.DeviceConstraints.toObject(includeInstance, f),
    packScope: (f = msg.getPackScope()) && proto.solutions.PackScope.toObject(includeInstance, f),
    boardsList: jspb.Message.toObjectList(msg.getBoardsList(),
    packsproto_packs_pb.BoardId.toObject, includeInstance)
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
 * @return {!proto.solutions.UnableToResolveDeviceOnMatchingBoards}
 */
proto.solutions.UnableToResolveDeviceOnMatchingBoards.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.UnableToResolveDeviceOnMatchingBoards;
  return proto.solutions.UnableToResolveDeviceOnMatchingBoards.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.UnableToResolveDeviceOnMatchingBoards} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.UnableToResolveDeviceOnMatchingBoards}
 */
proto.solutions.UnableToResolveDeviceOnMatchingBoards.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.BoardConstraints;
      reader.readMessage(value,proto.solutions.BoardConstraints.deserializeBinaryFromReader);
      msg.setBoardConstraints(value);
      break;
    case 2:
      var value = new proto.solutions.DeviceConstraints;
      reader.readMessage(value,proto.solutions.DeviceConstraints.deserializeBinaryFromReader);
      msg.setDeviceConstraints(value);
      break;
    case 3:
      var value = new proto.solutions.PackScope;
      reader.readMessage(value,proto.solutions.PackScope.deserializeBinaryFromReader);
      msg.setPackScope(value);
      break;
    case 4:
      var value = new packsproto_packs_pb.BoardId;
      reader.readMessage(value,packsproto_packs_pb.BoardId.deserializeBinaryFromReader);
      msg.addBoards(value);
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
proto.solutions.UnableToResolveDeviceOnMatchingBoards.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.UnableToResolveDeviceOnMatchingBoards.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.UnableToResolveDeviceOnMatchingBoards} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.UnableToResolveDeviceOnMatchingBoards.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBoardConstraints();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.BoardConstraints.serializeBinaryToWriter
    );
  }
  f = message.getDeviceConstraints();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.solutions.DeviceConstraints.serializeBinaryToWriter
    );
  }
  f = message.getPackScope();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.solutions.PackScope.serializeBinaryToWriter
    );
  }
  f = message.getBoardsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      4,
      f,
      packsproto_packs_pb.BoardId.serializeBinaryToWriter
    );
  }
};


/**
 * optional BoardConstraints board_constraints = 1;
 * @return {?proto.solutions.BoardConstraints}
 */
proto.solutions.UnableToResolveDeviceOnMatchingBoards.prototype.getBoardConstraints = function() {
  return /** @type{?proto.solutions.BoardConstraints} */ (
    jspb.Message.getWrapperField(this, proto.solutions.BoardConstraints, 1));
};


/**
 * @param {?proto.solutions.BoardConstraints|undefined} value
 * @return {!proto.solutions.UnableToResolveDeviceOnMatchingBoards} returns this
*/
proto.solutions.UnableToResolveDeviceOnMatchingBoards.prototype.setBoardConstraints = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.UnableToResolveDeviceOnMatchingBoards} returns this
 */
proto.solutions.UnableToResolveDeviceOnMatchingBoards.prototype.clearBoardConstraints = function() {
  return this.setBoardConstraints(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.UnableToResolveDeviceOnMatchingBoards.prototype.hasBoardConstraints = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional DeviceConstraints device_constraints = 2;
 * @return {?proto.solutions.DeviceConstraints}
 */
proto.solutions.UnableToResolveDeviceOnMatchingBoards.prototype.getDeviceConstraints = function() {
  return /** @type{?proto.solutions.DeviceConstraints} */ (
    jspb.Message.getWrapperField(this, proto.solutions.DeviceConstraints, 2));
};


/**
 * @param {?proto.solutions.DeviceConstraints|undefined} value
 * @return {!proto.solutions.UnableToResolveDeviceOnMatchingBoards} returns this
*/
proto.solutions.UnableToResolveDeviceOnMatchingBoards.prototype.setDeviceConstraints = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.UnableToResolveDeviceOnMatchingBoards} returns this
 */
proto.solutions.UnableToResolveDeviceOnMatchingBoards.prototype.clearDeviceConstraints = function() {
  return this.setDeviceConstraints(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.UnableToResolveDeviceOnMatchingBoards.prototype.hasDeviceConstraints = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional PackScope pack_scope = 3;
 * @return {?proto.solutions.PackScope}
 */
proto.solutions.UnableToResolveDeviceOnMatchingBoards.prototype.getPackScope = function() {
  return /** @type{?proto.solutions.PackScope} */ (
    jspb.Message.getWrapperField(this, proto.solutions.PackScope, 3));
};


/**
 * @param {?proto.solutions.PackScope|undefined} value
 * @return {!proto.solutions.UnableToResolveDeviceOnMatchingBoards} returns this
*/
proto.solutions.UnableToResolveDeviceOnMatchingBoards.prototype.setPackScope = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.UnableToResolveDeviceOnMatchingBoards} returns this
 */
proto.solutions.UnableToResolveDeviceOnMatchingBoards.prototype.clearPackScope = function() {
  return this.setPackScope(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.UnableToResolveDeviceOnMatchingBoards.prototype.hasPackScope = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * repeated packs.BoardId boards = 4;
 * @return {!Array<!proto.packs.BoardId>}
 */
proto.solutions.UnableToResolveDeviceOnMatchingBoards.prototype.getBoardsList = function() {
  return /** @type{!Array<!proto.packs.BoardId>} */ (
    jspb.Message.getRepeatedWrapperField(this, packsproto_packs_pb.BoardId, 4));
};


/**
 * @param {!Array<!proto.packs.BoardId>} value
 * @return {!proto.solutions.UnableToResolveDeviceOnMatchingBoards} returns this
*/
proto.solutions.UnableToResolveDeviceOnMatchingBoards.prototype.setBoardsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 4, value);
};


/**
 * @param {!proto.packs.BoardId=} opt_value
 * @param {number=} opt_index
 * @return {!proto.packs.BoardId}
 */
proto.solutions.UnableToResolveDeviceOnMatchingBoards.prototype.addBoards = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 4, opt_value, proto.packs.BoardId, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.UnableToResolveDeviceOnMatchingBoards} returns this
 */
proto.solutions.UnableToResolveDeviceOnMatchingBoards.prototype.clearBoardsList = function() {
  return this.setBoardsList([]);
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.UnableToResolveDeviceOnBoard.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.UnableToResolveDeviceOnBoard.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.UnableToResolveDeviceOnBoard} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.UnableToResolveDeviceOnBoard.toObject = function(includeInstance, msg) {
  var f, obj = {
    boardConstraints: (f = msg.getBoardConstraints()) && proto.solutions.BoardConstraints.toObject(includeInstance, f),
    packScope: (f = msg.getPackScope()) && proto.solutions.PackScope.toObject(includeInstance, f),
    board: (f = msg.getBoard()) && packsproto_packs_pb.BoardId.toObject(includeInstance, f)
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
 * @return {!proto.solutions.UnableToResolveDeviceOnBoard}
 */
proto.solutions.UnableToResolveDeviceOnBoard.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.UnableToResolveDeviceOnBoard;
  return proto.solutions.UnableToResolveDeviceOnBoard.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.UnableToResolveDeviceOnBoard} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.UnableToResolveDeviceOnBoard}
 */
proto.solutions.UnableToResolveDeviceOnBoard.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.BoardConstraints;
      reader.readMessage(value,proto.solutions.BoardConstraints.deserializeBinaryFromReader);
      msg.setBoardConstraints(value);
      break;
    case 2:
      var value = new proto.solutions.PackScope;
      reader.readMessage(value,proto.solutions.PackScope.deserializeBinaryFromReader);
      msg.setPackScope(value);
      break;
    case 3:
      var value = new packsproto_packs_pb.BoardId;
      reader.readMessage(value,packsproto_packs_pb.BoardId.deserializeBinaryFromReader);
      msg.setBoard(value);
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
proto.solutions.UnableToResolveDeviceOnBoard.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.UnableToResolveDeviceOnBoard.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.UnableToResolveDeviceOnBoard} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.UnableToResolveDeviceOnBoard.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBoardConstraints();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.BoardConstraints.serializeBinaryToWriter
    );
  }
  f = message.getPackScope();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.solutions.PackScope.serializeBinaryToWriter
    );
  }
  f = message.getBoard();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      packsproto_packs_pb.BoardId.serializeBinaryToWriter
    );
  }
};


/**
 * optional BoardConstraints board_constraints = 1;
 * @return {?proto.solutions.BoardConstraints}
 */
proto.solutions.UnableToResolveDeviceOnBoard.prototype.getBoardConstraints = function() {
  return /** @type{?proto.solutions.BoardConstraints} */ (
    jspb.Message.getWrapperField(this, proto.solutions.BoardConstraints, 1));
};


/**
 * @param {?proto.solutions.BoardConstraints|undefined} value
 * @return {!proto.solutions.UnableToResolveDeviceOnBoard} returns this
*/
proto.solutions.UnableToResolveDeviceOnBoard.prototype.setBoardConstraints = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.UnableToResolveDeviceOnBoard} returns this
 */
proto.solutions.UnableToResolveDeviceOnBoard.prototype.clearBoardConstraints = function() {
  return this.setBoardConstraints(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.UnableToResolveDeviceOnBoard.prototype.hasBoardConstraints = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional PackScope pack_scope = 2;
 * @return {?proto.solutions.PackScope}
 */
proto.solutions.UnableToResolveDeviceOnBoard.prototype.getPackScope = function() {
  return /** @type{?proto.solutions.PackScope} */ (
    jspb.Message.getWrapperField(this, proto.solutions.PackScope, 2));
};


/**
 * @param {?proto.solutions.PackScope|undefined} value
 * @return {!proto.solutions.UnableToResolveDeviceOnBoard} returns this
*/
proto.solutions.UnableToResolveDeviceOnBoard.prototype.setPackScope = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.UnableToResolveDeviceOnBoard} returns this
 */
proto.solutions.UnableToResolveDeviceOnBoard.prototype.clearPackScope = function() {
  return this.setPackScope(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.UnableToResolveDeviceOnBoard.prototype.hasPackScope = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional packs.BoardId board = 3;
 * @return {?proto.packs.BoardId}
 */
proto.solutions.UnableToResolveDeviceOnBoard.prototype.getBoard = function() {
  return /** @type{?proto.packs.BoardId} */ (
    jspb.Message.getWrapperField(this, packsproto_packs_pb.BoardId, 3));
};


/**
 * @param {?proto.packs.BoardId|undefined} value
 * @return {!proto.solutions.UnableToResolveDeviceOnBoard} returns this
*/
proto.solutions.UnableToResolveDeviceOnBoard.prototype.setBoard = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.UnableToResolveDeviceOnBoard} returns this
 */
proto.solutions.UnableToResolveDeviceOnBoard.prototype.clearBoard = function() {
  return this.setBoard(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.UnableToResolveDeviceOnBoard.prototype.hasBoard = function() {
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.DeviceNotFound.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.DeviceNotFound.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.DeviceNotFound} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.DeviceNotFound.toObject = function(includeInstance, msg) {
  var f, obj = {
    deviceConstraints: (f = msg.getDeviceConstraints()) && proto.solutions.DeviceConstraints.toObject(includeInstance, f),
    packScope: (f = msg.getPackScope()) && proto.solutions.PackScope.toObject(includeInstance, f)
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
 * @return {!proto.solutions.DeviceNotFound}
 */
proto.solutions.DeviceNotFound.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.DeviceNotFound;
  return proto.solutions.DeviceNotFound.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.DeviceNotFound} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.DeviceNotFound}
 */
proto.solutions.DeviceNotFound.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.DeviceConstraints;
      reader.readMessage(value,proto.solutions.DeviceConstraints.deserializeBinaryFromReader);
      msg.setDeviceConstraints(value);
      break;
    case 2:
      var value = new proto.solutions.PackScope;
      reader.readMessage(value,proto.solutions.PackScope.deserializeBinaryFromReader);
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
proto.solutions.DeviceNotFound.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.DeviceNotFound.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.DeviceNotFound} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.DeviceNotFound.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getDeviceConstraints();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.DeviceConstraints.serializeBinaryToWriter
    );
  }
  f = message.getPackScope();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.solutions.PackScope.serializeBinaryToWriter
    );
  }
};


/**
 * optional DeviceConstraints device_constraints = 1;
 * @return {?proto.solutions.DeviceConstraints}
 */
proto.solutions.DeviceNotFound.prototype.getDeviceConstraints = function() {
  return /** @type{?proto.solutions.DeviceConstraints} */ (
    jspb.Message.getWrapperField(this, proto.solutions.DeviceConstraints, 1));
};


/**
 * @param {?proto.solutions.DeviceConstraints|undefined} value
 * @return {!proto.solutions.DeviceNotFound} returns this
*/
proto.solutions.DeviceNotFound.prototype.setDeviceConstraints = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.DeviceNotFound} returns this
 */
proto.solutions.DeviceNotFound.prototype.clearDeviceConstraints = function() {
  return this.setDeviceConstraints(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.DeviceNotFound.prototype.hasDeviceConstraints = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional PackScope pack_scope = 2;
 * @return {?proto.solutions.PackScope}
 */
proto.solutions.DeviceNotFound.prototype.getPackScope = function() {
  return /** @type{?proto.solutions.PackScope} */ (
    jspb.Message.getWrapperField(this, proto.solutions.PackScope, 2));
};


/**
 * @param {?proto.solutions.PackScope|undefined} value
 * @return {!proto.solutions.DeviceNotFound} returns this
*/
proto.solutions.DeviceNotFound.prototype.setPackScope = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.DeviceNotFound} returns this
 */
proto.solutions.DeviceNotFound.prototype.clearPackScope = function() {
  return this.setPackScope(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.DeviceNotFound.prototype.hasPackScope = function() {
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.ProcessorNotFoundOnDevice.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.ProcessorNotFoundOnDevice.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.ProcessorNotFoundOnDevice} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ProcessorNotFoundOnDevice.toObject = function(includeInstance, msg) {
  var f, obj = {
    packScope: (f = msg.getPackScope()) && proto.solutions.PackScope.toObject(includeInstance, f),
    processor: jspb.Message.getFieldWithDefault(msg, 2, ""),
    deviceReference: (f = msg.getDeviceReference()) && packsproto_packs_pb.DeviceReference.toObject(includeInstance, f)
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
 * @return {!proto.solutions.ProcessorNotFoundOnDevice}
 */
proto.solutions.ProcessorNotFoundOnDevice.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.ProcessorNotFoundOnDevice;
  return proto.solutions.ProcessorNotFoundOnDevice.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.ProcessorNotFoundOnDevice} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.ProcessorNotFoundOnDevice}
 */
proto.solutions.ProcessorNotFoundOnDevice.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.PackScope;
      reader.readMessage(value,proto.solutions.PackScope.deserializeBinaryFromReader);
      msg.setPackScope(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setProcessor(value);
      break;
    case 3:
      var value = new packsproto_packs_pb.DeviceReference;
      reader.readMessage(value,packsproto_packs_pb.DeviceReference.deserializeBinaryFromReader);
      msg.setDeviceReference(value);
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
proto.solutions.ProcessorNotFoundOnDevice.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.ProcessorNotFoundOnDevice.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.ProcessorNotFoundOnDevice} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ProcessorNotFoundOnDevice.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPackScope();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.PackScope.serializeBinaryToWriter
    );
  }
  f = message.getProcessor();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getDeviceReference();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      packsproto_packs_pb.DeviceReference.serializeBinaryToWriter
    );
  }
};


/**
 * optional PackScope pack_scope = 1;
 * @return {?proto.solutions.PackScope}
 */
proto.solutions.ProcessorNotFoundOnDevice.prototype.getPackScope = function() {
  return /** @type{?proto.solutions.PackScope} */ (
    jspb.Message.getWrapperField(this, proto.solutions.PackScope, 1));
};


/**
 * @param {?proto.solutions.PackScope|undefined} value
 * @return {!proto.solutions.ProcessorNotFoundOnDevice} returns this
*/
proto.solutions.ProcessorNotFoundOnDevice.prototype.setPackScope = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ProcessorNotFoundOnDevice} returns this
 */
proto.solutions.ProcessorNotFoundOnDevice.prototype.clearPackScope = function() {
  return this.setPackScope(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ProcessorNotFoundOnDevice.prototype.hasPackScope = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional string processor = 2;
 * @return {string}
 */
proto.solutions.ProcessorNotFoundOnDevice.prototype.getProcessor = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.ProcessorNotFoundOnDevice} returns this
 */
proto.solutions.ProcessorNotFoundOnDevice.prototype.setProcessor = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional packs.DeviceReference device_reference = 3;
 * @return {?proto.packs.DeviceReference}
 */
proto.solutions.ProcessorNotFoundOnDevice.prototype.getDeviceReference = function() {
  return /** @type{?proto.packs.DeviceReference} */ (
    jspb.Message.getWrapperField(this, packsproto_packs_pb.DeviceReference, 3));
};


/**
 * @param {?proto.packs.DeviceReference|undefined} value
 * @return {!proto.solutions.ProcessorNotFoundOnDevice} returns this
*/
proto.solutions.ProcessorNotFoundOnDevice.prototype.setDeviceReference = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ProcessorNotFoundOnDevice} returns this
 */
proto.solutions.ProcessorNotFoundOnDevice.prototype.clearDeviceReference = function() {
  return this.setDeviceReference(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ProcessorNotFoundOnDevice.prototype.hasDeviceReference = function() {
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.ProcessorMustBeSpecified.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.ProcessorMustBeSpecified.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.ProcessorMustBeSpecified} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ProcessorMustBeSpecified.toObject = function(includeInstance, msg) {
  var f, obj = {
    packScope: (f = msg.getPackScope()) && proto.solutions.PackScope.toObject(includeInstance, f),
    deviceReference: (f = msg.getDeviceReference()) && packsproto_packs_pb.DeviceReference.toObject(includeInstance, f)
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
 * @return {!proto.solutions.ProcessorMustBeSpecified}
 */
proto.solutions.ProcessorMustBeSpecified.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.ProcessorMustBeSpecified;
  return proto.solutions.ProcessorMustBeSpecified.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.ProcessorMustBeSpecified} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.ProcessorMustBeSpecified}
 */
proto.solutions.ProcessorMustBeSpecified.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.PackScope;
      reader.readMessage(value,proto.solutions.PackScope.deserializeBinaryFromReader);
      msg.setPackScope(value);
      break;
    case 3:
      var value = new packsproto_packs_pb.DeviceReference;
      reader.readMessage(value,packsproto_packs_pb.DeviceReference.deserializeBinaryFromReader);
      msg.setDeviceReference(value);
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
proto.solutions.ProcessorMustBeSpecified.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.ProcessorMustBeSpecified.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.ProcessorMustBeSpecified} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ProcessorMustBeSpecified.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPackScope();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.PackScope.serializeBinaryToWriter
    );
  }
  f = message.getDeviceReference();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      packsproto_packs_pb.DeviceReference.serializeBinaryToWriter
    );
  }
};


/**
 * optional PackScope pack_scope = 1;
 * @return {?proto.solutions.PackScope}
 */
proto.solutions.ProcessorMustBeSpecified.prototype.getPackScope = function() {
  return /** @type{?proto.solutions.PackScope} */ (
    jspb.Message.getWrapperField(this, proto.solutions.PackScope, 1));
};


/**
 * @param {?proto.solutions.PackScope|undefined} value
 * @return {!proto.solutions.ProcessorMustBeSpecified} returns this
*/
proto.solutions.ProcessorMustBeSpecified.prototype.setPackScope = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ProcessorMustBeSpecified} returns this
 */
proto.solutions.ProcessorMustBeSpecified.prototype.clearPackScope = function() {
  return this.setPackScope(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ProcessorMustBeSpecified.prototype.hasPackScope = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional packs.DeviceReference device_reference = 3;
 * @return {?proto.packs.DeviceReference}
 */
proto.solutions.ProcessorMustBeSpecified.prototype.getDeviceReference = function() {
  return /** @type{?proto.packs.DeviceReference} */ (
    jspb.Message.getWrapperField(this, packsproto_packs_pb.DeviceReference, 3));
};


/**
 * @param {?proto.packs.DeviceReference|undefined} value
 * @return {!proto.solutions.ProcessorMustBeSpecified} returns this
*/
proto.solutions.ProcessorMustBeSpecified.prototype.setDeviceReference = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ProcessorMustBeSpecified} returns this
 */
proto.solutions.ProcessorMustBeSpecified.prototype.clearDeviceReference = function() {
  return this.setDeviceReference(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ProcessorMustBeSpecified.prototype.hasDeviceReference = function() {
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.BoardConstraints.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.BoardConstraints.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.BoardConstraints} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.BoardConstraints.toObject = function(includeInstance, msg) {
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
 * @return {!proto.solutions.BoardConstraints}
 */
proto.solutions.BoardConstraints.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.BoardConstraints;
  return proto.solutions.BoardConstraints.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.BoardConstraints} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.BoardConstraints}
 */
proto.solutions.BoardConstraints.deserializeBinaryFromReader = function(msg, reader) {
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
proto.solutions.BoardConstraints.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.BoardConstraints.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.BoardConstraints} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.BoardConstraints.serializeBinaryToWriter = function(message, writer) {
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
proto.solutions.BoardConstraints.prototype.getVendor = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.BoardConstraints} returns this
 */
proto.solutions.BoardConstraints.prototype.setVendor = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string name = 2;
 * @return {string}
 */
proto.solutions.BoardConstraints.prototype.getName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.BoardConstraints} returns this
 */
proto.solutions.BoardConstraints.prototype.setName = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string revision = 3;
 * @return {string}
 */
proto.solutions.BoardConstraints.prototype.getRevision = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.BoardConstraints} returns this
 */
proto.solutions.BoardConstraints.prototype.setRevision = function(value) {
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.DeviceConstraints.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.DeviceConstraints.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.DeviceConstraints} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.DeviceConstraints.toObject = function(includeInstance, msg) {
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
 * @return {!proto.solutions.DeviceConstraints}
 */
proto.solutions.DeviceConstraints.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.DeviceConstraints;
  return proto.solutions.DeviceConstraints.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.DeviceConstraints} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.DeviceConstraints}
 */
proto.solutions.DeviceConstraints.deserializeBinaryFromReader = function(msg, reader) {
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
proto.solutions.DeviceConstraints.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.DeviceConstraints.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.DeviceConstraints} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.DeviceConstraints.serializeBinaryToWriter = function(message, writer) {
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
proto.solutions.DeviceConstraints.prototype.getVendor = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.DeviceConstraints} returns this
 */
proto.solutions.DeviceConstraints.prototype.setVendor = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string name = 2;
 * @return {string}
 */
proto.solutions.DeviceConstraints.prototype.getName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.DeviceConstraints} returns this
 */
proto.solutions.DeviceConstraints.prototype.setName = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string processor = 3;
 * @return {string}
 */
proto.solutions.DeviceConstraints.prototype.getProcessor = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.DeviceConstraints} returns this
 */
proto.solutions.DeviceConstraints.prototype.setProcessor = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.solutions.PackScope.repeatedFields_ = [1];



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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.PackScope.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.PackScope.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.PackScope} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.PackScope.toObject = function(includeInstance, msg) {
  var f, obj = {
    packScopeList: jspb.Message.toObjectList(msg.getPackScopeList(),
    packsproto_packs_pb.PackId.toObject, includeInstance)
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
 * @return {!proto.solutions.PackScope}
 */
proto.solutions.PackScope.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.PackScope;
  return proto.solutions.PackScope.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.PackScope} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.PackScope}
 */
proto.solutions.PackScope.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new packsproto_packs_pb.PackId;
      reader.readMessage(value,packsproto_packs_pb.PackId.deserializeBinaryFromReader);
      msg.addPackScope(value);
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
proto.solutions.PackScope.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.PackScope.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.PackScope} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.PackScope.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPackScopeList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      packsproto_packs_pb.PackId.serializeBinaryToWriter
    );
  }
};


/**
 * repeated packs.PackId pack_scope = 1;
 * @return {!Array<!proto.packs.PackId>}
 */
proto.solutions.PackScope.prototype.getPackScopeList = function() {
  return /** @type{!Array<!proto.packs.PackId>} */ (
    jspb.Message.getRepeatedWrapperField(this, packsproto_packs_pb.PackId, 1));
};


/**
 * @param {!Array<!proto.packs.PackId>} value
 * @return {!proto.solutions.PackScope} returns this
*/
proto.solutions.PackScope.prototype.setPackScopeList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.packs.PackId=} opt_value
 * @param {number=} opt_index
 * @return {!proto.packs.PackId}
 */
proto.solutions.PackScope.prototype.addPackScope = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.packs.PackId, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.PackScope} returns this
 */
proto.solutions.PackScope.prototype.clearPackScopeList = function() {
  return this.setPackScopeList([]);
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.ComponentClassDoc.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.ComponentClassDoc.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.ComponentClassDoc} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentClassDoc.toObject = function(includeInstance, msg) {
  var f, obj = {
    className: jspb.Message.getFieldWithDefault(msg, 1, ""),
    bundleName: jspb.Message.getFieldWithDefault(msg, 2, ""),
    doc: (f = msg.getDoc()) && packsproto_packs_pb.Doc.toObject(includeInstance, f)
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
 * @return {!proto.solutions.ComponentClassDoc}
 */
proto.solutions.ComponentClassDoc.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.ComponentClassDoc;
  return proto.solutions.ComponentClassDoc.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.ComponentClassDoc} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.ComponentClassDoc}
 */
proto.solutions.ComponentClassDoc.deserializeBinaryFromReader = function(msg, reader) {
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
      msg.setBundleName(value);
      break;
    case 3:
      var value = new packsproto_packs_pb.Doc;
      reader.readMessage(value,packsproto_packs_pb.Doc.deserializeBinaryFromReader);
      msg.setDoc(value);
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
proto.solutions.ComponentClassDoc.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.ComponentClassDoc.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.ComponentClassDoc} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentClassDoc.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getClassName();
  if (f.length > 0) {
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
  f = message.getDoc();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      packsproto_packs_pb.Doc.serializeBinaryToWriter
    );
  }
};


/**
 * optional string class_name = 1;
 * @return {string}
 */
proto.solutions.ComponentClassDoc.prototype.getClassName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.ComponentClassDoc} returns this
 */
proto.solutions.ComponentClassDoc.prototype.setClassName = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string bundle_name = 2;
 * @return {string}
 */
proto.solutions.ComponentClassDoc.prototype.getBundleName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.ComponentClassDoc} returns this
 */
proto.solutions.ComponentClassDoc.prototype.setBundleName = function(value) {
  return jspb.Message.setField(this, 2, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.solutions.ComponentClassDoc} returns this
 */
proto.solutions.ComponentClassDoc.prototype.clearBundleName = function() {
  return jspb.Message.setField(this, 2, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ComponentClassDoc.prototype.hasBundleName = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional packs.Doc doc = 3;
 * @return {?proto.packs.Doc}
 */
proto.solutions.ComponentClassDoc.prototype.getDoc = function() {
  return /** @type{?proto.packs.Doc} */ (
    jspb.Message.getWrapperField(this, packsproto_packs_pb.Doc, 3));
};


/**
 * @param {?proto.packs.Doc|undefined} value
 * @return {!proto.solutions.ComponentClassDoc} returns this
*/
proto.solutions.ComponentClassDoc.prototype.setDoc = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ComponentClassDoc} returns this
 */
proto.solutions.ComponentClassDoc.prototype.clearDoc = function() {
  return this.setDoc(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ComponentClassDoc.prototype.hasDoc = function() {
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.ComponentGroupDoc.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.ComponentGroupDoc.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.ComponentGroupDoc} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentGroupDoc.toObject = function(includeInstance, msg) {
  var f, obj = {
    className: jspb.Message.getFieldWithDefault(msg, 1, ""),
    group: jspb.Message.getFieldWithDefault(msg, 2, ""),
    buildContext: (f = msg.getBuildContext()) && proto.solutions.BuildContext.toObject(includeInstance, f),
    doc: (f = msg.getDoc()) && packsproto_packs_pb.Doc.toObject(includeInstance, f)
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
 * @return {!proto.solutions.ComponentGroupDoc}
 */
proto.solutions.ComponentGroupDoc.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.ComponentGroupDoc;
  return proto.solutions.ComponentGroupDoc.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.ComponentGroupDoc} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.ComponentGroupDoc}
 */
proto.solutions.ComponentGroupDoc.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = new proto.solutions.BuildContext;
      reader.readMessage(value,proto.solutions.BuildContext.deserializeBinaryFromReader);
      msg.setBuildContext(value);
      break;
    case 4:
      var value = new packsproto_packs_pb.Doc;
      reader.readMessage(value,packsproto_packs_pb.Doc.deserializeBinaryFromReader);
      msg.setDoc(value);
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
proto.solutions.ComponentGroupDoc.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.ComponentGroupDoc.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.ComponentGroupDoc} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentGroupDoc.serializeBinaryToWriter = function(message, writer) {
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
  f = message.getBuildContext();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.solutions.BuildContext.serializeBinaryToWriter
    );
  }
  f = message.getDoc();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      packsproto_packs_pb.Doc.serializeBinaryToWriter
    );
  }
};


/**
 * optional string class_name = 1;
 * @return {string}
 */
proto.solutions.ComponentGroupDoc.prototype.getClassName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.ComponentGroupDoc} returns this
 */
proto.solutions.ComponentGroupDoc.prototype.setClassName = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string group = 2;
 * @return {string}
 */
proto.solutions.ComponentGroupDoc.prototype.getGroup = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.ComponentGroupDoc} returns this
 */
proto.solutions.ComponentGroupDoc.prototype.setGroup = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional BuildContext build_context = 3;
 * @return {?proto.solutions.BuildContext}
 */
proto.solutions.ComponentGroupDoc.prototype.getBuildContext = function() {
  return /** @type{?proto.solutions.BuildContext} */ (
    jspb.Message.getWrapperField(this, proto.solutions.BuildContext, 3));
};


/**
 * @param {?proto.solutions.BuildContext|undefined} value
 * @return {!proto.solutions.ComponentGroupDoc} returns this
*/
proto.solutions.ComponentGroupDoc.prototype.setBuildContext = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ComponentGroupDoc} returns this
 */
proto.solutions.ComponentGroupDoc.prototype.clearBuildContext = function() {
  return this.setBuildContext(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ComponentGroupDoc.prototype.hasBuildContext = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional packs.Doc doc = 4;
 * @return {?proto.packs.Doc}
 */
proto.solutions.ComponentGroupDoc.prototype.getDoc = function() {
  return /** @type{?proto.packs.Doc} */ (
    jspb.Message.getWrapperField(this, packsproto_packs_pb.Doc, 4));
};


/**
 * @param {?proto.packs.Doc|undefined} value
 * @return {!proto.solutions.ComponentGroupDoc} returns this
*/
proto.solutions.ComponentGroupDoc.prototype.setDoc = function(value) {
  return jspb.Message.setWrapperField(this, 4, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ComponentGroupDoc} returns this
 */
proto.solutions.ComponentGroupDoc.prototype.clearDoc = function() {
  return this.setDoc(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ComponentGroupDoc.prototype.hasDoc = function() {
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.SelectedPackInfo.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.SelectedPackInfo.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.SelectedPackInfo} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.SelectedPackInfo.toObject = function(includeInstance, msg) {
  var f, obj = {
    buildContext: (f = msg.getBuildContext()) && proto.solutions.BuildContext.toObject(includeInstance, f),
    packId: (f = msg.getPackId()) && packsproto_packs_pb.PackId.toObject(includeInstance, f),
    reference: (f = msg.getReference()) && proto.solutions.TrackedPackReference.toObject(includeInstance, f)
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
 * @return {!proto.solutions.SelectedPackInfo}
 */
proto.solutions.SelectedPackInfo.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.SelectedPackInfo;
  return proto.solutions.SelectedPackInfo.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.SelectedPackInfo} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.SelectedPackInfo}
 */
proto.solutions.SelectedPackInfo.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.BuildContext;
      reader.readMessage(value,proto.solutions.BuildContext.deserializeBinaryFromReader);
      msg.setBuildContext(value);
      break;
    case 2:
      var value = new packsproto_packs_pb.PackId;
      reader.readMessage(value,packsproto_packs_pb.PackId.deserializeBinaryFromReader);
      msg.setPackId(value);
      break;
    case 3:
      var value = new proto.solutions.TrackedPackReference;
      reader.readMessage(value,proto.solutions.TrackedPackReference.deserializeBinaryFromReader);
      msg.setReference(value);
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
proto.solutions.SelectedPackInfo.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.SelectedPackInfo.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.SelectedPackInfo} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.SelectedPackInfo.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBuildContext();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.BuildContext.serializeBinaryToWriter
    );
  }
  f = message.getPackId();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      packsproto_packs_pb.PackId.serializeBinaryToWriter
    );
  }
  f = message.getReference();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.solutions.TrackedPackReference.serializeBinaryToWriter
    );
  }
};


/**
 * optional BuildContext build_context = 1;
 * @return {?proto.solutions.BuildContext}
 */
proto.solutions.SelectedPackInfo.prototype.getBuildContext = function() {
  return /** @type{?proto.solutions.BuildContext} */ (
    jspb.Message.getWrapperField(this, proto.solutions.BuildContext, 1));
};


/**
 * @param {?proto.solutions.BuildContext|undefined} value
 * @return {!proto.solutions.SelectedPackInfo} returns this
*/
proto.solutions.SelectedPackInfo.prototype.setBuildContext = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.SelectedPackInfo} returns this
 */
proto.solutions.SelectedPackInfo.prototype.clearBuildContext = function() {
  return this.setBuildContext(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.SelectedPackInfo.prototype.hasBuildContext = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional packs.PackId pack_id = 2;
 * @return {?proto.packs.PackId}
 */
proto.solutions.SelectedPackInfo.prototype.getPackId = function() {
  return /** @type{?proto.packs.PackId} */ (
    jspb.Message.getWrapperField(this, packsproto_packs_pb.PackId, 2));
};


/**
 * @param {?proto.packs.PackId|undefined} value
 * @return {!proto.solutions.SelectedPackInfo} returns this
*/
proto.solutions.SelectedPackInfo.prototype.setPackId = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.SelectedPackInfo} returns this
 */
proto.solutions.SelectedPackInfo.prototype.clearPackId = function() {
  return this.setPackId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.SelectedPackInfo.prototype.hasPackId = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional TrackedPackReference reference = 3;
 * @return {?proto.solutions.TrackedPackReference}
 */
proto.solutions.SelectedPackInfo.prototype.getReference = function() {
  return /** @type{?proto.solutions.TrackedPackReference} */ (
    jspb.Message.getWrapperField(this, proto.solutions.TrackedPackReference, 3));
};


/**
 * @param {?proto.solutions.TrackedPackReference|undefined} value
 * @return {!proto.solutions.SelectedPackInfo} returns this
*/
proto.solutions.SelectedPackInfo.prototype.setReference = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.SelectedPackInfo} returns this
 */
proto.solutions.SelectedPackInfo.prototype.clearReference = function() {
  return this.setReference(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.SelectedPackInfo.prototype.hasReference = function() {
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.PackReference.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.PackReference.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.PackReference} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.PackReference.toObject = function(includeInstance, msg) {
  var f, obj = {
    vendor: jspb.Message.getFieldWithDefault(msg, 1, ""),
    name: jspb.Message.getFieldWithDefault(msg, 2, ""),
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
 * @return {!proto.solutions.PackReference}
 */
proto.solutions.PackReference.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.PackReference;
  return proto.solutions.PackReference.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.PackReference} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.PackReference}
 */
proto.solutions.PackReference.deserializeBinaryFromReader = function(msg, reader) {
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
proto.solutions.PackReference.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.PackReference.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.PackReference} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.PackReference.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getVendor();
  if (f.length > 0) {
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
 * optional string vendor = 1;
 * @return {string}
 */
proto.solutions.PackReference.prototype.getVendor = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.PackReference} returns this
 */
proto.solutions.PackReference.prototype.setVendor = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string name = 2;
 * @return {string}
 */
proto.solutions.PackReference.prototype.getName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.PackReference} returns this
 */
proto.solutions.PackReference.prototype.setName = function(value) {
  return jspb.Message.setField(this, 2, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.solutions.PackReference} returns this
 */
proto.solutions.PackReference.prototype.clearName = function() {
  return jspb.Message.setField(this, 2, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.PackReference.prototype.hasName = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional string version = 3;
 * @return {string}
 */
proto.solutions.PackReference.prototype.getVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.PackReference} returns this
 */
proto.solutions.PackReference.prototype.setVersion = function(value) {
  return jspb.Message.setField(this, 3, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.solutions.PackReference} returns this
 */
proto.solutions.PackReference.prototype.clearVersion = function() {
  return jspb.Message.setField(this, 3, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.PackReference.prototype.hasVersion = function() {
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.TrackedPackReference.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.TrackedPackReference.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.TrackedPackReference} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.TrackedPackReference.toObject = function(includeInstance, msg) {
  var f, obj = {
    reference: (f = msg.getReference()) && proto.solutions.PackReference.toObject(includeInstance, f),
    origin: (f = msg.getOrigin()) && proto.solutions.PackOrigin.toObject(includeInstance, f)
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
 * @return {!proto.solutions.TrackedPackReference}
 */
proto.solutions.TrackedPackReference.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.TrackedPackReference;
  return proto.solutions.TrackedPackReference.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.TrackedPackReference} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.TrackedPackReference}
 */
proto.solutions.TrackedPackReference.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.PackReference;
      reader.readMessage(value,proto.solutions.PackReference.deserializeBinaryFromReader);
      msg.setReference(value);
      break;
    case 2:
      var value = new proto.solutions.PackOrigin;
      reader.readMessage(value,proto.solutions.PackOrigin.deserializeBinaryFromReader);
      msg.setOrigin(value);
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
proto.solutions.TrackedPackReference.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.TrackedPackReference.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.TrackedPackReference} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.TrackedPackReference.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getReference();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.PackReference.serializeBinaryToWriter
    );
  }
  f = message.getOrigin();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.solutions.PackOrigin.serializeBinaryToWriter
    );
  }
};


/**
 * optional PackReference reference = 1;
 * @return {?proto.solutions.PackReference}
 */
proto.solutions.TrackedPackReference.prototype.getReference = function() {
  return /** @type{?proto.solutions.PackReference} */ (
    jspb.Message.getWrapperField(this, proto.solutions.PackReference, 1));
};


/**
 * @param {?proto.solutions.PackReference|undefined} value
 * @return {!proto.solutions.TrackedPackReference} returns this
*/
proto.solutions.TrackedPackReference.prototype.setReference = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.TrackedPackReference} returns this
 */
proto.solutions.TrackedPackReference.prototype.clearReference = function() {
  return this.setReference(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.TrackedPackReference.prototype.hasReference = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional PackOrigin origin = 2;
 * @return {?proto.solutions.PackOrigin}
 */
proto.solutions.TrackedPackReference.prototype.getOrigin = function() {
  return /** @type{?proto.solutions.PackOrigin} */ (
    jspb.Message.getWrapperField(this, proto.solutions.PackOrigin, 2));
};


/**
 * @param {?proto.solutions.PackOrigin|undefined} value
 * @return {!proto.solutions.TrackedPackReference} returns this
*/
proto.solutions.TrackedPackReference.prototype.setOrigin = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.TrackedPackReference} returns this
 */
proto.solutions.TrackedPackReference.prototype.clearOrigin = function() {
  return this.setOrigin(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.TrackedPackReference.prototype.hasOrigin = function() {
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.Solution.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.Solution.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.Solution} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.Solution.toObject = function(includeInstance, msg) {
  var f, obj = {

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
 * @return {!proto.solutions.Solution}
 */
proto.solutions.Solution.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.Solution;
  return proto.solutions.Solution.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.Solution} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.Solution}
 */
proto.solutions.Solution.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
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
proto.solutions.Solution.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.Solution.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.Solution} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.Solution.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};



/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.solutions.PackOrigin.oneofGroups_ = [[1,2,3]];

/**
 * @enum {number}
 */
proto.solutions.PackOrigin.OriginCase = {
  ORIGIN_NOT_SET: 0,
  SOLUTION: 1,
  PROJECT_ID: 2,
  LAYER_ID: 3
};

/**
 * @return {proto.solutions.PackOrigin.OriginCase}
 */
proto.solutions.PackOrigin.prototype.getOriginCase = function() {
  return /** @type {proto.solutions.PackOrigin.OriginCase} */(jspb.Message.computeOneofCase(this, proto.solutions.PackOrigin.oneofGroups_[0]));
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.PackOrigin.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.PackOrigin.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.PackOrigin} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.PackOrigin.toObject = function(includeInstance, msg) {
  var f, obj = {
    solution: (f = msg.getSolution()) && proto.solutions.Solution.toObject(includeInstance, f),
    projectId: (f = msg.getProjectId()) && proto.solutions.ProjectId.toObject(includeInstance, f),
    layerId: (f = msg.getLayerId()) && proto.solutions.LayerId.toObject(includeInstance, f)
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
 * @return {!proto.solutions.PackOrigin}
 */
proto.solutions.PackOrigin.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.PackOrigin;
  return proto.solutions.PackOrigin.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.PackOrigin} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.PackOrigin}
 */
proto.solutions.PackOrigin.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.Solution;
      reader.readMessage(value,proto.solutions.Solution.deserializeBinaryFromReader);
      msg.setSolution(value);
      break;
    case 2:
      var value = new proto.solutions.ProjectId;
      reader.readMessage(value,proto.solutions.ProjectId.deserializeBinaryFromReader);
      msg.setProjectId(value);
      break;
    case 3:
      var value = new proto.solutions.LayerId;
      reader.readMessage(value,proto.solutions.LayerId.deserializeBinaryFromReader);
      msg.setLayerId(value);
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
proto.solutions.PackOrigin.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.PackOrigin.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.PackOrigin} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.PackOrigin.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSolution();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.Solution.serializeBinaryToWriter
    );
  }
  f = message.getProjectId();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.solutions.ProjectId.serializeBinaryToWriter
    );
  }
  f = message.getLayerId();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.solutions.LayerId.serializeBinaryToWriter
    );
  }
};


/**
 * optional Solution solution = 1;
 * @return {?proto.solutions.Solution}
 */
proto.solutions.PackOrigin.prototype.getSolution = function() {
  return /** @type{?proto.solutions.Solution} */ (
    jspb.Message.getWrapperField(this, proto.solutions.Solution, 1));
};


/**
 * @param {?proto.solutions.Solution|undefined} value
 * @return {!proto.solutions.PackOrigin} returns this
*/
proto.solutions.PackOrigin.prototype.setSolution = function(value) {
  return jspb.Message.setOneofWrapperField(this, 1, proto.solutions.PackOrigin.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.PackOrigin} returns this
 */
proto.solutions.PackOrigin.prototype.clearSolution = function() {
  return this.setSolution(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.PackOrigin.prototype.hasSolution = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional ProjectId project_id = 2;
 * @return {?proto.solutions.ProjectId}
 */
proto.solutions.PackOrigin.prototype.getProjectId = function() {
  return /** @type{?proto.solutions.ProjectId} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ProjectId, 2));
};


/**
 * @param {?proto.solutions.ProjectId|undefined} value
 * @return {!proto.solutions.PackOrigin} returns this
*/
proto.solutions.PackOrigin.prototype.setProjectId = function(value) {
  return jspb.Message.setOneofWrapperField(this, 2, proto.solutions.PackOrigin.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.PackOrigin} returns this
 */
proto.solutions.PackOrigin.prototype.clearProjectId = function() {
  return this.setProjectId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.PackOrigin.prototype.hasProjectId = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional LayerId layer_id = 3;
 * @return {?proto.solutions.LayerId}
 */
proto.solutions.PackOrigin.prototype.getLayerId = function() {
  return /** @type{?proto.solutions.LayerId} */ (
    jspb.Message.getWrapperField(this, proto.solutions.LayerId, 3));
};


/**
 * @param {?proto.solutions.LayerId|undefined} value
 * @return {!proto.solutions.PackOrigin} returns this
*/
proto.solutions.PackOrigin.prototype.setLayerId = function(value) {
  return jspb.Message.setOneofWrapperField(this, 3, proto.solutions.PackOrigin.oneofGroups_[0], value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.PackOrigin} returns this
 */
proto.solutions.PackOrigin.prototype.clearLayerId = function() {
  return this.setLayerId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.PackOrigin.prototype.hasLayerId = function() {
  return jspb.Message.getField(this, 3) != null;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.solutions.SolutionData.repeatedFields_ = [2,3,4,5,6];



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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.SolutionData.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.SolutionData.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.SolutionData} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.SolutionData.toObject = function(includeInstance, msg) {
  var f, obj = {
    targetTypesList: jspb.Message.toObjectList(msg.getTargetTypesList(),
    proto.solutions.TargetTypeData.toObject, includeInstance),
    buildTypesList: jspb.Message.toObjectList(msg.getBuildTypesList(),
    proto.solutions.BuildTypeData.toObject, includeInstance),
    projectsList: jspb.Message.toObjectList(msg.getProjectsList(),
    proto.solutions.ProjectData.toObject, includeInstance),
    packsList: jspb.Message.toObjectList(msg.getPacksList(),
    proto.solutions.PackData.toObject, includeInstance),
    layersList: jspb.Message.toObjectList(msg.getLayersList(),
    proto.solutions.LayerData.toObject, includeInstance),
    processor: (f = msg.getProcessor()) && proto.solutions.ProcessorData.toObject(includeInstance, f),
    compiler: (f = msg.getCompiler()) && proto.solutions.Compiler.toObject(includeInstance, f),
    defaultConfiguration: (f = msg.getDefaultConfiguration()) && proto.solutions.DefaultConfigurationData.toObject(includeInstance, f)
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
 * @return {!proto.solutions.SolutionData}
 */
proto.solutions.SolutionData.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.SolutionData;
  return proto.solutions.SolutionData.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.SolutionData} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.SolutionData}
 */
proto.solutions.SolutionData.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 2:
      var value = new proto.solutions.TargetTypeData;
      reader.readMessage(value,proto.solutions.TargetTypeData.deserializeBinaryFromReader);
      msg.addTargetTypes(value);
      break;
    case 3:
      var value = new proto.solutions.BuildTypeData;
      reader.readMessage(value,proto.solutions.BuildTypeData.deserializeBinaryFromReader);
      msg.addBuildTypes(value);
      break;
    case 4:
      var value = new proto.solutions.ProjectData;
      reader.readMessage(value,proto.solutions.ProjectData.deserializeBinaryFromReader);
      msg.addProjects(value);
      break;
    case 5:
      var value = new proto.solutions.PackData;
      reader.readMessage(value,proto.solutions.PackData.deserializeBinaryFromReader);
      msg.addPacks(value);
      break;
    case 6:
      var value = new proto.solutions.LayerData;
      reader.readMessage(value,proto.solutions.LayerData.deserializeBinaryFromReader);
      msg.addLayers(value);
      break;
    case 7:
      var value = new proto.solutions.ProcessorData;
      reader.readMessage(value,proto.solutions.ProcessorData.deserializeBinaryFromReader);
      msg.setProcessor(value);
      break;
    case 8:
      var value = new proto.solutions.Compiler;
      reader.readMessage(value,proto.solutions.Compiler.deserializeBinaryFromReader);
      msg.setCompiler(value);
      break;
    case 9:
      var value = new proto.solutions.DefaultConfigurationData;
      reader.readMessage(value,proto.solutions.DefaultConfigurationData.deserializeBinaryFromReader);
      msg.setDefaultConfiguration(value);
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
proto.solutions.SolutionData.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.SolutionData.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.SolutionData} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.SolutionData.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTargetTypesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      2,
      f,
      proto.solutions.TargetTypeData.serializeBinaryToWriter
    );
  }
  f = message.getBuildTypesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      proto.solutions.BuildTypeData.serializeBinaryToWriter
    );
  }
  f = message.getProjectsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      4,
      f,
      proto.solutions.ProjectData.serializeBinaryToWriter
    );
  }
  f = message.getPacksList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      5,
      f,
      proto.solutions.PackData.serializeBinaryToWriter
    );
  }
  f = message.getLayersList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      6,
      f,
      proto.solutions.LayerData.serializeBinaryToWriter
    );
  }
  f = message.getProcessor();
  if (f != null) {
    writer.writeMessage(
      7,
      f,
      proto.solutions.ProcessorData.serializeBinaryToWriter
    );
  }
  f = message.getCompiler();
  if (f != null) {
    writer.writeMessage(
      8,
      f,
      proto.solutions.Compiler.serializeBinaryToWriter
    );
  }
  f = message.getDefaultConfiguration();
  if (f != null) {
    writer.writeMessage(
      9,
      f,
      proto.solutions.DefaultConfigurationData.serializeBinaryToWriter
    );
  }
};


/**
 * repeated TargetTypeData target_types = 2;
 * @return {!Array<!proto.solutions.TargetTypeData>}
 */
proto.solutions.SolutionData.prototype.getTargetTypesList = function() {
  return /** @type{!Array<!proto.solutions.TargetTypeData>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.solutions.TargetTypeData, 2));
};


/**
 * @param {!Array<!proto.solutions.TargetTypeData>} value
 * @return {!proto.solutions.SolutionData} returns this
*/
proto.solutions.SolutionData.prototype.setTargetTypesList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 2, value);
};


/**
 * @param {!proto.solutions.TargetTypeData=} opt_value
 * @param {number=} opt_index
 * @return {!proto.solutions.TargetTypeData}
 */
proto.solutions.SolutionData.prototype.addTargetTypes = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 2, opt_value, proto.solutions.TargetTypeData, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.SolutionData} returns this
 */
proto.solutions.SolutionData.prototype.clearTargetTypesList = function() {
  return this.setTargetTypesList([]);
};


/**
 * repeated BuildTypeData build_types = 3;
 * @return {!Array<!proto.solutions.BuildTypeData>}
 */
proto.solutions.SolutionData.prototype.getBuildTypesList = function() {
  return /** @type{!Array<!proto.solutions.BuildTypeData>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.solutions.BuildTypeData, 3));
};


/**
 * @param {!Array<!proto.solutions.BuildTypeData>} value
 * @return {!proto.solutions.SolutionData} returns this
*/
proto.solutions.SolutionData.prototype.setBuildTypesList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.solutions.BuildTypeData=} opt_value
 * @param {number=} opt_index
 * @return {!proto.solutions.BuildTypeData}
 */
proto.solutions.SolutionData.prototype.addBuildTypes = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.solutions.BuildTypeData, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.SolutionData} returns this
 */
proto.solutions.SolutionData.prototype.clearBuildTypesList = function() {
  return this.setBuildTypesList([]);
};


/**
 * repeated ProjectData projects = 4;
 * @return {!Array<!proto.solutions.ProjectData>}
 */
proto.solutions.SolutionData.prototype.getProjectsList = function() {
  return /** @type{!Array<!proto.solutions.ProjectData>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.solutions.ProjectData, 4));
};


/**
 * @param {!Array<!proto.solutions.ProjectData>} value
 * @return {!proto.solutions.SolutionData} returns this
*/
proto.solutions.SolutionData.prototype.setProjectsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 4, value);
};


/**
 * @param {!proto.solutions.ProjectData=} opt_value
 * @param {number=} opt_index
 * @return {!proto.solutions.ProjectData}
 */
proto.solutions.SolutionData.prototype.addProjects = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 4, opt_value, proto.solutions.ProjectData, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.SolutionData} returns this
 */
proto.solutions.SolutionData.prototype.clearProjectsList = function() {
  return this.setProjectsList([]);
};


/**
 * repeated PackData packs = 5;
 * @return {!Array<!proto.solutions.PackData>}
 */
proto.solutions.SolutionData.prototype.getPacksList = function() {
  return /** @type{!Array<!proto.solutions.PackData>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.solutions.PackData, 5));
};


/**
 * @param {!Array<!proto.solutions.PackData>} value
 * @return {!proto.solutions.SolutionData} returns this
*/
proto.solutions.SolutionData.prototype.setPacksList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 5, value);
};


/**
 * @param {!proto.solutions.PackData=} opt_value
 * @param {number=} opt_index
 * @return {!proto.solutions.PackData}
 */
proto.solutions.SolutionData.prototype.addPacks = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 5, opt_value, proto.solutions.PackData, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.SolutionData} returns this
 */
proto.solutions.SolutionData.prototype.clearPacksList = function() {
  return this.setPacksList([]);
};


/**
 * repeated LayerData layers = 6;
 * @return {!Array<!proto.solutions.LayerData>}
 */
proto.solutions.SolutionData.prototype.getLayersList = function() {
  return /** @type{!Array<!proto.solutions.LayerData>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.solutions.LayerData, 6));
};


/**
 * @param {!Array<!proto.solutions.LayerData>} value
 * @return {!proto.solutions.SolutionData} returns this
*/
proto.solutions.SolutionData.prototype.setLayersList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 6, value);
};


/**
 * @param {!proto.solutions.LayerData=} opt_value
 * @param {number=} opt_index
 * @return {!proto.solutions.LayerData}
 */
proto.solutions.SolutionData.prototype.addLayers = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 6, opt_value, proto.solutions.LayerData, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.SolutionData} returns this
 */
proto.solutions.SolutionData.prototype.clearLayersList = function() {
  return this.setLayersList([]);
};


/**
 * optional ProcessorData processor = 7;
 * @return {?proto.solutions.ProcessorData}
 */
proto.solutions.SolutionData.prototype.getProcessor = function() {
  return /** @type{?proto.solutions.ProcessorData} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ProcessorData, 7));
};


/**
 * @param {?proto.solutions.ProcessorData|undefined} value
 * @return {!proto.solutions.SolutionData} returns this
*/
proto.solutions.SolutionData.prototype.setProcessor = function(value) {
  return jspb.Message.setWrapperField(this, 7, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.SolutionData} returns this
 */
proto.solutions.SolutionData.prototype.clearProcessor = function() {
  return this.setProcessor(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.SolutionData.prototype.hasProcessor = function() {
  return jspb.Message.getField(this, 7) != null;
};


/**
 * optional Compiler compiler = 8;
 * @return {?proto.solutions.Compiler}
 */
proto.solutions.SolutionData.prototype.getCompiler = function() {
  return /** @type{?proto.solutions.Compiler} */ (
    jspb.Message.getWrapperField(this, proto.solutions.Compiler, 8));
};


/**
 * @param {?proto.solutions.Compiler|undefined} value
 * @return {!proto.solutions.SolutionData} returns this
*/
proto.solutions.SolutionData.prototype.setCompiler = function(value) {
  return jspb.Message.setWrapperField(this, 8, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.SolutionData} returns this
 */
proto.solutions.SolutionData.prototype.clearCompiler = function() {
  return this.setCompiler(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.SolutionData.prototype.hasCompiler = function() {
  return jspb.Message.getField(this, 8) != null;
};


/**
 * optional DefaultConfigurationData default_configuration = 9;
 * @return {?proto.solutions.DefaultConfigurationData}
 */
proto.solutions.SolutionData.prototype.getDefaultConfiguration = function() {
  return /** @type{?proto.solutions.DefaultConfigurationData} */ (
    jspb.Message.getWrapperField(this, proto.solutions.DefaultConfigurationData, 9));
};


/**
 * @param {?proto.solutions.DefaultConfigurationData|undefined} value
 * @return {!proto.solutions.SolutionData} returns this
*/
proto.solutions.SolutionData.prototype.setDefaultConfiguration = function(value) {
  return jspb.Message.setWrapperField(this, 9, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.SolutionData} returns this
 */
proto.solutions.SolutionData.prototype.clearDefaultConfiguration = function() {
  return this.setDefaultConfiguration(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.SolutionData.prototype.hasDefaultConfiguration = function() {
  return jspb.Message.getField(this, 9) != null;
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.TargetTypeData.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.TargetTypeData.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.TargetTypeData} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.TargetTypeData.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: (f = msg.getId()) && proto.solutions.TargetTypeId.toObject(includeInstance, f),
    board: (f = msg.getBoard()) && proto.solutions.BoardReference.toObject(includeInstance, f),
    device: (f = msg.getDevice()) && proto.solutions.Device.toObject(includeInstance, f),
    processor: (f = msg.getProcessor()) && proto.solutions.ProcessorData.toObject(includeInstance, f),
    compiler: (f = msg.getCompiler()) && proto.solutions.Compiler.toObject(includeInstance, f)
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
 * @return {!proto.solutions.TargetTypeData}
 */
proto.solutions.TargetTypeData.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.TargetTypeData;
  return proto.solutions.TargetTypeData.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.TargetTypeData} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.TargetTypeData}
 */
proto.solutions.TargetTypeData.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.TargetTypeId;
      reader.readMessage(value,proto.solutions.TargetTypeId.deserializeBinaryFromReader);
      msg.setId(value);
      break;
    case 2:
      var value = new proto.solutions.BoardReference;
      reader.readMessage(value,proto.solutions.BoardReference.deserializeBinaryFromReader);
      msg.setBoard(value);
      break;
    case 3:
      var value = new proto.solutions.Device;
      reader.readMessage(value,proto.solutions.Device.deserializeBinaryFromReader);
      msg.setDevice(value);
      break;
    case 4:
      var value = new proto.solutions.ProcessorData;
      reader.readMessage(value,proto.solutions.ProcessorData.deserializeBinaryFromReader);
      msg.setProcessor(value);
      break;
    case 5:
      var value = new proto.solutions.Compiler;
      reader.readMessage(value,proto.solutions.Compiler.deserializeBinaryFromReader);
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
proto.solutions.TargetTypeData.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.TargetTypeData.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.TargetTypeData} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.TargetTypeData.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.TargetTypeId.serializeBinaryToWriter
    );
  }
  f = message.getBoard();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.solutions.BoardReference.serializeBinaryToWriter
    );
  }
  f = message.getDevice();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.solutions.Device.serializeBinaryToWriter
    );
  }
  f = message.getProcessor();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.solutions.ProcessorData.serializeBinaryToWriter
    );
  }
  f = message.getCompiler();
  if (f != null) {
    writer.writeMessage(
      5,
      f,
      proto.solutions.Compiler.serializeBinaryToWriter
    );
  }
};


/**
 * optional TargetTypeId id = 1;
 * @return {?proto.solutions.TargetTypeId}
 */
proto.solutions.TargetTypeData.prototype.getId = function() {
  return /** @type{?proto.solutions.TargetTypeId} */ (
    jspb.Message.getWrapperField(this, proto.solutions.TargetTypeId, 1));
};


/**
 * @param {?proto.solutions.TargetTypeId|undefined} value
 * @return {!proto.solutions.TargetTypeData} returns this
*/
proto.solutions.TargetTypeData.prototype.setId = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.TargetTypeData} returns this
 */
proto.solutions.TargetTypeData.prototype.clearId = function() {
  return this.setId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.TargetTypeData.prototype.hasId = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional BoardReference board = 2;
 * @return {?proto.solutions.BoardReference}
 */
proto.solutions.TargetTypeData.prototype.getBoard = function() {
  return /** @type{?proto.solutions.BoardReference} */ (
    jspb.Message.getWrapperField(this, proto.solutions.BoardReference, 2));
};


/**
 * @param {?proto.solutions.BoardReference|undefined} value
 * @return {!proto.solutions.TargetTypeData} returns this
*/
proto.solutions.TargetTypeData.prototype.setBoard = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.TargetTypeData} returns this
 */
proto.solutions.TargetTypeData.prototype.clearBoard = function() {
  return this.setBoard(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.TargetTypeData.prototype.hasBoard = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional Device device = 3;
 * @return {?proto.solutions.Device}
 */
proto.solutions.TargetTypeData.prototype.getDevice = function() {
  return /** @type{?proto.solutions.Device} */ (
    jspb.Message.getWrapperField(this, proto.solutions.Device, 3));
};


/**
 * @param {?proto.solutions.Device|undefined} value
 * @return {!proto.solutions.TargetTypeData} returns this
*/
proto.solutions.TargetTypeData.prototype.setDevice = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.TargetTypeData} returns this
 */
proto.solutions.TargetTypeData.prototype.clearDevice = function() {
  return this.setDevice(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.TargetTypeData.prototype.hasDevice = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional ProcessorData processor = 4;
 * @return {?proto.solutions.ProcessorData}
 */
proto.solutions.TargetTypeData.prototype.getProcessor = function() {
  return /** @type{?proto.solutions.ProcessorData} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ProcessorData, 4));
};


/**
 * @param {?proto.solutions.ProcessorData|undefined} value
 * @return {!proto.solutions.TargetTypeData} returns this
*/
proto.solutions.TargetTypeData.prototype.setProcessor = function(value) {
  return jspb.Message.setWrapperField(this, 4, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.TargetTypeData} returns this
 */
proto.solutions.TargetTypeData.prototype.clearProcessor = function() {
  return this.setProcessor(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.TargetTypeData.prototype.hasProcessor = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional Compiler compiler = 5;
 * @return {?proto.solutions.Compiler}
 */
proto.solutions.TargetTypeData.prototype.getCompiler = function() {
  return /** @type{?proto.solutions.Compiler} */ (
    jspb.Message.getWrapperField(this, proto.solutions.Compiler, 5));
};


/**
 * @param {?proto.solutions.Compiler|undefined} value
 * @return {!proto.solutions.TargetTypeData} returns this
*/
proto.solutions.TargetTypeData.prototype.setCompiler = function(value) {
  return jspb.Message.setWrapperField(this, 5, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.TargetTypeData} returns this
 */
proto.solutions.TargetTypeData.prototype.clearCompiler = function() {
  return this.setCompiler(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.TargetTypeData.prototype.hasCompiler = function() {
  return jspb.Message.getField(this, 5) != null;
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.BuildTypeData.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.BuildTypeData.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.BuildTypeData} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.BuildTypeData.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: (f = msg.getId()) && proto.solutions.BuildTypeId.toObject(includeInstance, f),
    processor: (f = msg.getProcessor()) && proto.solutions.ProcessorData.toObject(includeInstance, f),
    compiler: (f = msg.getCompiler()) && proto.solutions.Compiler.toObject(includeInstance, f)
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
 * @return {!proto.solutions.BuildTypeData}
 */
proto.solutions.BuildTypeData.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.BuildTypeData;
  return proto.solutions.BuildTypeData.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.BuildTypeData} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.BuildTypeData}
 */
proto.solutions.BuildTypeData.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.BuildTypeId;
      reader.readMessage(value,proto.solutions.BuildTypeId.deserializeBinaryFromReader);
      msg.setId(value);
      break;
    case 2:
      var value = new proto.solutions.ProcessorData;
      reader.readMessage(value,proto.solutions.ProcessorData.deserializeBinaryFromReader);
      msg.setProcessor(value);
      break;
    case 3:
      var value = new proto.solutions.Compiler;
      reader.readMessage(value,proto.solutions.Compiler.deserializeBinaryFromReader);
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
proto.solutions.BuildTypeData.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.BuildTypeData.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.BuildTypeData} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.BuildTypeData.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.BuildTypeId.serializeBinaryToWriter
    );
  }
  f = message.getProcessor();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.solutions.ProcessorData.serializeBinaryToWriter
    );
  }
  f = message.getCompiler();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.solutions.Compiler.serializeBinaryToWriter
    );
  }
};


/**
 * optional BuildTypeId id = 1;
 * @return {?proto.solutions.BuildTypeId}
 */
proto.solutions.BuildTypeData.prototype.getId = function() {
  return /** @type{?proto.solutions.BuildTypeId} */ (
    jspb.Message.getWrapperField(this, proto.solutions.BuildTypeId, 1));
};


/**
 * @param {?proto.solutions.BuildTypeId|undefined} value
 * @return {!proto.solutions.BuildTypeData} returns this
*/
proto.solutions.BuildTypeData.prototype.setId = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.BuildTypeData} returns this
 */
proto.solutions.BuildTypeData.prototype.clearId = function() {
  return this.setId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.BuildTypeData.prototype.hasId = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional ProcessorData processor = 2;
 * @return {?proto.solutions.ProcessorData}
 */
proto.solutions.BuildTypeData.prototype.getProcessor = function() {
  return /** @type{?proto.solutions.ProcessorData} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ProcessorData, 2));
};


/**
 * @param {?proto.solutions.ProcessorData|undefined} value
 * @return {!proto.solutions.BuildTypeData} returns this
*/
proto.solutions.BuildTypeData.prototype.setProcessor = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.BuildTypeData} returns this
 */
proto.solutions.BuildTypeData.prototype.clearProcessor = function() {
  return this.setProcessor(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.BuildTypeData.prototype.hasProcessor = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional Compiler compiler = 3;
 * @return {?proto.solutions.Compiler}
 */
proto.solutions.BuildTypeData.prototype.getCompiler = function() {
  return /** @type{?proto.solutions.Compiler} */ (
    jspb.Message.getWrapperField(this, proto.solutions.Compiler, 3));
};


/**
 * @param {?proto.solutions.Compiler|undefined} value
 * @return {!proto.solutions.BuildTypeData} returns this
*/
proto.solutions.BuildTypeData.prototype.setCompiler = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.BuildTypeData} returns this
 */
proto.solutions.BuildTypeData.prototype.clearCompiler = function() {
  return this.setCompiler(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.BuildTypeData.prototype.hasCompiler = function() {
  return jspb.Message.getField(this, 3) != null;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.solutions.ProjectData.repeatedFields_ = [2,3,4,5,6];



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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.ProjectData.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.ProjectData.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.ProjectData} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ProjectData.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: (f = msg.getId()) && proto.solutions.ProjectId.toObject(includeInstance, f),
    componentsList: jspb.Message.toObjectList(msg.getComponentsList(),
    proto.solutions.ComponentData.toObject, includeInstance),
    forContextsList: jspb.Message.toObjectList(msg.getForContextsList(),
    proto.solutions.BuildContext.toObject, includeInstance),
    notForContextsList: jspb.Message.toObjectList(msg.getNotForContextsList(),
    proto.solutions.BuildContext.toObject, includeInstance),
    packsList: jspb.Message.toObjectList(msg.getPacksList(),
    proto.solutions.PackData.toObject, includeInstance),
    layersList: jspb.Message.toObjectList(msg.getLayersList(),
    proto.solutions.IncludedLayer.toObject, includeInstance),
    board: (f = msg.getBoard()) && proto.solutions.BoardReference.toObject(includeInstance, f),
    device: (f = msg.getDevice()) && proto.solutions.Device.toObject(includeInstance, f),
    processor: (f = msg.getProcessor()) && proto.solutions.ProcessorData.toObject(includeInstance, f),
    compiler: (f = msg.getCompiler()) && proto.solutions.Compiler.toObject(includeInstance, f)
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
 * @return {!proto.solutions.ProjectData}
 */
proto.solutions.ProjectData.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.ProjectData;
  return proto.solutions.ProjectData.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.ProjectData} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.ProjectData}
 */
proto.solutions.ProjectData.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.ProjectId;
      reader.readMessage(value,proto.solutions.ProjectId.deserializeBinaryFromReader);
      msg.setId(value);
      break;
    case 2:
      var value = new proto.solutions.ComponentData;
      reader.readMessage(value,proto.solutions.ComponentData.deserializeBinaryFromReader);
      msg.addComponents(value);
      break;
    case 3:
      var value = new proto.solutions.BuildContext;
      reader.readMessage(value,proto.solutions.BuildContext.deserializeBinaryFromReader);
      msg.addForContexts(value);
      break;
    case 4:
      var value = new proto.solutions.BuildContext;
      reader.readMessage(value,proto.solutions.BuildContext.deserializeBinaryFromReader);
      msg.addNotForContexts(value);
      break;
    case 5:
      var value = new proto.solutions.PackData;
      reader.readMessage(value,proto.solutions.PackData.deserializeBinaryFromReader);
      msg.addPacks(value);
      break;
    case 6:
      var value = new proto.solutions.IncludedLayer;
      reader.readMessage(value,proto.solutions.IncludedLayer.deserializeBinaryFromReader);
      msg.addLayers(value);
      break;
    case 7:
      var value = new proto.solutions.BoardReference;
      reader.readMessage(value,proto.solutions.BoardReference.deserializeBinaryFromReader);
      msg.setBoard(value);
      break;
    case 8:
      var value = new proto.solutions.Device;
      reader.readMessage(value,proto.solutions.Device.deserializeBinaryFromReader);
      msg.setDevice(value);
      break;
    case 9:
      var value = new proto.solutions.ProcessorData;
      reader.readMessage(value,proto.solutions.ProcessorData.deserializeBinaryFromReader);
      msg.setProcessor(value);
      break;
    case 10:
      var value = new proto.solutions.Compiler;
      reader.readMessage(value,proto.solutions.Compiler.deserializeBinaryFromReader);
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
proto.solutions.ProjectData.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.ProjectData.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.ProjectData} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ProjectData.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.ProjectId.serializeBinaryToWriter
    );
  }
  f = message.getComponentsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      2,
      f,
      proto.solutions.ComponentData.serializeBinaryToWriter
    );
  }
  f = message.getForContextsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      proto.solutions.BuildContext.serializeBinaryToWriter
    );
  }
  f = message.getNotForContextsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      4,
      f,
      proto.solutions.BuildContext.serializeBinaryToWriter
    );
  }
  f = message.getPacksList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      5,
      f,
      proto.solutions.PackData.serializeBinaryToWriter
    );
  }
  f = message.getLayersList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      6,
      f,
      proto.solutions.IncludedLayer.serializeBinaryToWriter
    );
  }
  f = message.getBoard();
  if (f != null) {
    writer.writeMessage(
      7,
      f,
      proto.solutions.BoardReference.serializeBinaryToWriter
    );
  }
  f = message.getDevice();
  if (f != null) {
    writer.writeMessage(
      8,
      f,
      proto.solutions.Device.serializeBinaryToWriter
    );
  }
  f = message.getProcessor();
  if (f != null) {
    writer.writeMessage(
      9,
      f,
      proto.solutions.ProcessorData.serializeBinaryToWriter
    );
  }
  f = message.getCompiler();
  if (f != null) {
    writer.writeMessage(
      10,
      f,
      proto.solutions.Compiler.serializeBinaryToWriter
    );
  }
};


/**
 * optional ProjectId id = 1;
 * @return {?proto.solutions.ProjectId}
 */
proto.solutions.ProjectData.prototype.getId = function() {
  return /** @type{?proto.solutions.ProjectId} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ProjectId, 1));
};


/**
 * @param {?proto.solutions.ProjectId|undefined} value
 * @return {!proto.solutions.ProjectData} returns this
*/
proto.solutions.ProjectData.prototype.setId = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ProjectData} returns this
 */
proto.solutions.ProjectData.prototype.clearId = function() {
  return this.setId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ProjectData.prototype.hasId = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * repeated ComponentData components = 2;
 * @return {!Array<!proto.solutions.ComponentData>}
 */
proto.solutions.ProjectData.prototype.getComponentsList = function() {
  return /** @type{!Array<!proto.solutions.ComponentData>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.solutions.ComponentData, 2));
};


/**
 * @param {!Array<!proto.solutions.ComponentData>} value
 * @return {!proto.solutions.ProjectData} returns this
*/
proto.solutions.ProjectData.prototype.setComponentsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 2, value);
};


/**
 * @param {!proto.solutions.ComponentData=} opt_value
 * @param {number=} opt_index
 * @return {!proto.solutions.ComponentData}
 */
proto.solutions.ProjectData.prototype.addComponents = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 2, opt_value, proto.solutions.ComponentData, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.ProjectData} returns this
 */
proto.solutions.ProjectData.prototype.clearComponentsList = function() {
  return this.setComponentsList([]);
};


/**
 * repeated BuildContext for_contexts = 3;
 * @return {!Array<!proto.solutions.BuildContext>}
 */
proto.solutions.ProjectData.prototype.getForContextsList = function() {
  return /** @type{!Array<!proto.solutions.BuildContext>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.solutions.BuildContext, 3));
};


/**
 * @param {!Array<!proto.solutions.BuildContext>} value
 * @return {!proto.solutions.ProjectData} returns this
*/
proto.solutions.ProjectData.prototype.setForContextsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.solutions.BuildContext=} opt_value
 * @param {number=} opt_index
 * @return {!proto.solutions.BuildContext}
 */
proto.solutions.ProjectData.prototype.addForContexts = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.solutions.BuildContext, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.ProjectData} returns this
 */
proto.solutions.ProjectData.prototype.clearForContextsList = function() {
  return this.setForContextsList([]);
};


/**
 * repeated BuildContext not_for_contexts = 4;
 * @return {!Array<!proto.solutions.BuildContext>}
 */
proto.solutions.ProjectData.prototype.getNotForContextsList = function() {
  return /** @type{!Array<!proto.solutions.BuildContext>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.solutions.BuildContext, 4));
};


/**
 * @param {!Array<!proto.solutions.BuildContext>} value
 * @return {!proto.solutions.ProjectData} returns this
*/
proto.solutions.ProjectData.prototype.setNotForContextsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 4, value);
};


/**
 * @param {!proto.solutions.BuildContext=} opt_value
 * @param {number=} opt_index
 * @return {!proto.solutions.BuildContext}
 */
proto.solutions.ProjectData.prototype.addNotForContexts = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 4, opt_value, proto.solutions.BuildContext, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.ProjectData} returns this
 */
proto.solutions.ProjectData.prototype.clearNotForContextsList = function() {
  return this.setNotForContextsList([]);
};


/**
 * repeated PackData packs = 5;
 * @return {!Array<!proto.solutions.PackData>}
 */
proto.solutions.ProjectData.prototype.getPacksList = function() {
  return /** @type{!Array<!proto.solutions.PackData>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.solutions.PackData, 5));
};


/**
 * @param {!Array<!proto.solutions.PackData>} value
 * @return {!proto.solutions.ProjectData} returns this
*/
proto.solutions.ProjectData.prototype.setPacksList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 5, value);
};


/**
 * @param {!proto.solutions.PackData=} opt_value
 * @param {number=} opt_index
 * @return {!proto.solutions.PackData}
 */
proto.solutions.ProjectData.prototype.addPacks = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 5, opt_value, proto.solutions.PackData, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.ProjectData} returns this
 */
proto.solutions.ProjectData.prototype.clearPacksList = function() {
  return this.setPacksList([]);
};


/**
 * repeated IncludedLayer layers = 6;
 * @return {!Array<!proto.solutions.IncludedLayer>}
 */
proto.solutions.ProjectData.prototype.getLayersList = function() {
  return /** @type{!Array<!proto.solutions.IncludedLayer>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.solutions.IncludedLayer, 6));
};


/**
 * @param {!Array<!proto.solutions.IncludedLayer>} value
 * @return {!proto.solutions.ProjectData} returns this
*/
proto.solutions.ProjectData.prototype.setLayersList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 6, value);
};


/**
 * @param {!proto.solutions.IncludedLayer=} opt_value
 * @param {number=} opt_index
 * @return {!proto.solutions.IncludedLayer}
 */
proto.solutions.ProjectData.prototype.addLayers = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 6, opt_value, proto.solutions.IncludedLayer, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.ProjectData} returns this
 */
proto.solutions.ProjectData.prototype.clearLayersList = function() {
  return this.setLayersList([]);
};


/**
 * optional BoardReference board = 7;
 * @return {?proto.solutions.BoardReference}
 */
proto.solutions.ProjectData.prototype.getBoard = function() {
  return /** @type{?proto.solutions.BoardReference} */ (
    jspb.Message.getWrapperField(this, proto.solutions.BoardReference, 7));
};


/**
 * @param {?proto.solutions.BoardReference|undefined} value
 * @return {!proto.solutions.ProjectData} returns this
*/
proto.solutions.ProjectData.prototype.setBoard = function(value) {
  return jspb.Message.setWrapperField(this, 7, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ProjectData} returns this
 */
proto.solutions.ProjectData.prototype.clearBoard = function() {
  return this.setBoard(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ProjectData.prototype.hasBoard = function() {
  return jspb.Message.getField(this, 7) != null;
};


/**
 * optional Device device = 8;
 * @return {?proto.solutions.Device}
 */
proto.solutions.ProjectData.prototype.getDevice = function() {
  return /** @type{?proto.solutions.Device} */ (
    jspb.Message.getWrapperField(this, proto.solutions.Device, 8));
};


/**
 * @param {?proto.solutions.Device|undefined} value
 * @return {!proto.solutions.ProjectData} returns this
*/
proto.solutions.ProjectData.prototype.setDevice = function(value) {
  return jspb.Message.setWrapperField(this, 8, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ProjectData} returns this
 */
proto.solutions.ProjectData.prototype.clearDevice = function() {
  return this.setDevice(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ProjectData.prototype.hasDevice = function() {
  return jspb.Message.getField(this, 8) != null;
};


/**
 * optional ProcessorData processor = 9;
 * @return {?proto.solutions.ProcessorData}
 */
proto.solutions.ProjectData.prototype.getProcessor = function() {
  return /** @type{?proto.solutions.ProcessorData} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ProcessorData, 9));
};


/**
 * @param {?proto.solutions.ProcessorData|undefined} value
 * @return {!proto.solutions.ProjectData} returns this
*/
proto.solutions.ProjectData.prototype.setProcessor = function(value) {
  return jspb.Message.setWrapperField(this, 9, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ProjectData} returns this
 */
proto.solutions.ProjectData.prototype.clearProcessor = function() {
  return this.setProcessor(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ProjectData.prototype.hasProcessor = function() {
  return jspb.Message.getField(this, 9) != null;
};


/**
 * optional Compiler compiler = 10;
 * @return {?proto.solutions.Compiler}
 */
proto.solutions.ProjectData.prototype.getCompiler = function() {
  return /** @type{?proto.solutions.Compiler} */ (
    jspb.Message.getWrapperField(this, proto.solutions.Compiler, 10));
};


/**
 * @param {?proto.solutions.Compiler|undefined} value
 * @return {!proto.solutions.ProjectData} returns this
*/
proto.solutions.ProjectData.prototype.setCompiler = function(value) {
  return jspb.Message.setWrapperField(this, 10, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ProjectData} returns this
 */
proto.solutions.ProjectData.prototype.clearCompiler = function() {
  return this.setCompiler(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ProjectData.prototype.hasCompiler = function() {
  return jspb.Message.getField(this, 10) != null;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.solutions.PackData.repeatedFields_ = [3,4];



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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.PackData.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.PackData.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.PackData} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.PackData.toObject = function(includeInstance, msg) {
  var f, obj = {
    reference: (f = msg.getReference()) && proto.solutions.PackReference.toObject(includeInstance, f),
    forContextsList: jspb.Message.toObjectList(msg.getForContextsList(),
    proto.solutions.BuildContext.toObject, includeInstance),
    notForContextsList: jspb.Message.toObjectList(msg.getNotForContextsList(),
    proto.solutions.BuildContext.toObject, includeInstance)
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
 * @return {!proto.solutions.PackData}
 */
proto.solutions.PackData.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.PackData;
  return proto.solutions.PackData.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.PackData} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.PackData}
 */
proto.solutions.PackData.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.PackReference;
      reader.readMessage(value,proto.solutions.PackReference.deserializeBinaryFromReader);
      msg.setReference(value);
      break;
    case 3:
      var value = new proto.solutions.BuildContext;
      reader.readMessage(value,proto.solutions.BuildContext.deserializeBinaryFromReader);
      msg.addForContexts(value);
      break;
    case 4:
      var value = new proto.solutions.BuildContext;
      reader.readMessage(value,proto.solutions.BuildContext.deserializeBinaryFromReader);
      msg.addNotForContexts(value);
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
proto.solutions.PackData.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.PackData.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.PackData} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.PackData.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getReference();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.PackReference.serializeBinaryToWriter
    );
  }
  f = message.getForContextsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      proto.solutions.BuildContext.serializeBinaryToWriter
    );
  }
  f = message.getNotForContextsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      4,
      f,
      proto.solutions.BuildContext.serializeBinaryToWriter
    );
  }
};


/**
 * optional PackReference reference = 1;
 * @return {?proto.solutions.PackReference}
 */
proto.solutions.PackData.prototype.getReference = function() {
  return /** @type{?proto.solutions.PackReference} */ (
    jspb.Message.getWrapperField(this, proto.solutions.PackReference, 1));
};


/**
 * @param {?proto.solutions.PackReference|undefined} value
 * @return {!proto.solutions.PackData} returns this
*/
proto.solutions.PackData.prototype.setReference = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.PackData} returns this
 */
proto.solutions.PackData.prototype.clearReference = function() {
  return this.setReference(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.PackData.prototype.hasReference = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * repeated BuildContext for_contexts = 3;
 * @return {!Array<!proto.solutions.BuildContext>}
 */
proto.solutions.PackData.prototype.getForContextsList = function() {
  return /** @type{!Array<!proto.solutions.BuildContext>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.solutions.BuildContext, 3));
};


/**
 * @param {!Array<!proto.solutions.BuildContext>} value
 * @return {!proto.solutions.PackData} returns this
*/
proto.solutions.PackData.prototype.setForContextsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.solutions.BuildContext=} opt_value
 * @param {number=} opt_index
 * @return {!proto.solutions.BuildContext}
 */
proto.solutions.PackData.prototype.addForContexts = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.solutions.BuildContext, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.PackData} returns this
 */
proto.solutions.PackData.prototype.clearForContextsList = function() {
  return this.setForContextsList([]);
};


/**
 * repeated BuildContext not_for_contexts = 4;
 * @return {!Array<!proto.solutions.BuildContext>}
 */
proto.solutions.PackData.prototype.getNotForContextsList = function() {
  return /** @type{!Array<!proto.solutions.BuildContext>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.solutions.BuildContext, 4));
};


/**
 * @param {!Array<!proto.solutions.BuildContext>} value
 * @return {!proto.solutions.PackData} returns this
*/
proto.solutions.PackData.prototype.setNotForContextsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 4, value);
};


/**
 * @param {!proto.solutions.BuildContext=} opt_value
 * @param {number=} opt_index
 * @return {!proto.solutions.BuildContext}
 */
proto.solutions.PackData.prototype.addNotForContexts = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 4, opt_value, proto.solutions.BuildContext, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.PackData} returns this
 */
proto.solutions.PackData.prototype.clearNotForContextsList = function() {
  return this.setNotForContextsList([]);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.solutions.ComponentData.repeatedFields_ = [2,3];



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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.ComponentData.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.ComponentData.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.ComponentData} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentData.toObject = function(includeInstance, msg) {
  var f, obj = {
    reference: (f = msg.getReference()) && proto.solutions.ComponentReference.toObject(includeInstance, f),
    forContextsList: jspb.Message.toObjectList(msg.getForContextsList(),
    proto.solutions.BuildContext.toObject, includeInstance),
    notForContextsList: jspb.Message.toObjectList(msg.getNotForContextsList(),
    proto.solutions.BuildContext.toObject, includeInstance),
    instances: jspb.Message.getFieldWithDefault(msg, 4, 0)
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
 * @return {!proto.solutions.ComponentData}
 */
proto.solutions.ComponentData.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.ComponentData;
  return proto.solutions.ComponentData.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.ComponentData} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.ComponentData}
 */
proto.solutions.ComponentData.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.ComponentReference;
      reader.readMessage(value,proto.solutions.ComponentReference.deserializeBinaryFromReader);
      msg.setReference(value);
      break;
    case 2:
      var value = new proto.solutions.BuildContext;
      reader.readMessage(value,proto.solutions.BuildContext.deserializeBinaryFromReader);
      msg.addForContexts(value);
      break;
    case 3:
      var value = new proto.solutions.BuildContext;
      reader.readMessage(value,proto.solutions.BuildContext.deserializeBinaryFromReader);
      msg.addNotForContexts(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setInstances(value);
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
proto.solutions.ComponentData.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.ComponentData.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.ComponentData} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ComponentData.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getReference();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.ComponentReference.serializeBinaryToWriter
    );
  }
  f = message.getForContextsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      2,
      f,
      proto.solutions.BuildContext.serializeBinaryToWriter
    );
  }
  f = message.getNotForContextsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      proto.solutions.BuildContext.serializeBinaryToWriter
    );
  }
  f = message.getInstances();
  if (f !== 0) {
    writer.writeInt32(
      4,
      f
    );
  }
};


/**
 * optional ComponentReference reference = 1;
 * @return {?proto.solutions.ComponentReference}
 */
proto.solutions.ComponentData.prototype.getReference = function() {
  return /** @type{?proto.solutions.ComponentReference} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ComponentReference, 1));
};


/**
 * @param {?proto.solutions.ComponentReference|undefined} value
 * @return {!proto.solutions.ComponentData} returns this
*/
proto.solutions.ComponentData.prototype.setReference = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.ComponentData} returns this
 */
proto.solutions.ComponentData.prototype.clearReference = function() {
  return this.setReference(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.ComponentData.prototype.hasReference = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * repeated BuildContext for_contexts = 2;
 * @return {!Array<!proto.solutions.BuildContext>}
 */
proto.solutions.ComponentData.prototype.getForContextsList = function() {
  return /** @type{!Array<!proto.solutions.BuildContext>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.solutions.BuildContext, 2));
};


/**
 * @param {!Array<!proto.solutions.BuildContext>} value
 * @return {!proto.solutions.ComponentData} returns this
*/
proto.solutions.ComponentData.prototype.setForContextsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 2, value);
};


/**
 * @param {!proto.solutions.BuildContext=} opt_value
 * @param {number=} opt_index
 * @return {!proto.solutions.BuildContext}
 */
proto.solutions.ComponentData.prototype.addForContexts = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 2, opt_value, proto.solutions.BuildContext, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.ComponentData} returns this
 */
proto.solutions.ComponentData.prototype.clearForContextsList = function() {
  return this.setForContextsList([]);
};


/**
 * repeated BuildContext not_for_contexts = 3;
 * @return {!Array<!proto.solutions.BuildContext>}
 */
proto.solutions.ComponentData.prototype.getNotForContextsList = function() {
  return /** @type{!Array<!proto.solutions.BuildContext>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.solutions.BuildContext, 3));
};


/**
 * @param {!Array<!proto.solutions.BuildContext>} value
 * @return {!proto.solutions.ComponentData} returns this
*/
proto.solutions.ComponentData.prototype.setNotForContextsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.solutions.BuildContext=} opt_value
 * @param {number=} opt_index
 * @return {!proto.solutions.BuildContext}
 */
proto.solutions.ComponentData.prototype.addNotForContexts = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.solutions.BuildContext, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.ComponentData} returns this
 */
proto.solutions.ComponentData.prototype.clearNotForContextsList = function() {
  return this.setNotForContextsList([]);
};


/**
 * optional int32 instances = 4;
 * @return {number}
 */
proto.solutions.ComponentData.prototype.getInstances = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {number} value
 * @return {!proto.solutions.ComponentData} returns this
 */
proto.solutions.ComponentData.prototype.setInstances = function(value) {
  return jspb.Message.setProto3IntField(this, 4, value);
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.ProcessorData.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.ProcessorData.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.ProcessorData} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ProcessorData.toObject = function(includeInstance, msg) {
  var f, obj = {
    fpu: jspb.Message.getFieldWithDefault(msg, 1, 0),
    trustzone: jspb.Message.getFieldWithDefault(msg, 2, 0),
    endian: jspb.Message.getFieldWithDefault(msg, 3, 0),
    dsp: jspb.Message.getFieldWithDefault(msg, 4, 0),
    mve: jspb.Message.getFieldWithDefault(msg, 5, 0),
    branchProtection: jspb.Message.getFieldWithDefault(msg, 6, 0)
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
 * @return {!proto.solutions.ProcessorData}
 */
proto.solutions.ProcessorData.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.ProcessorData;
  return proto.solutions.ProcessorData.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.ProcessorData} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.ProcessorData}
 */
proto.solutions.ProcessorData.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!proto.solutions.Fpu} */ (reader.readEnum());
      msg.setFpu(value);
      break;
    case 2:
      var value = /** @type {!proto.solutions.Trustzone} */ (reader.readEnum());
      msg.setTrustzone(value);
      break;
    case 3:
      var value = /** @type {!proto.solutions.Endian} */ (reader.readEnum());
      msg.setEndian(value);
      break;
    case 4:
      var value = /** @type {!proto.solutions.Dsp} */ (reader.readEnum());
      msg.setDsp(value);
      break;
    case 5:
      var value = /** @type {!proto.solutions.Mve} */ (reader.readEnum());
      msg.setMve(value);
      break;
    case 6:
      var value = /** @type {!proto.solutions.BranchProtection} */ (reader.readEnum());
      msg.setBranchProtection(value);
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
proto.solutions.ProcessorData.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.ProcessorData.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.ProcessorData} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.ProcessorData.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getFpu();
  if (f !== 0.0) {
    writer.writeEnum(
      1,
      f
    );
  }
  f = message.getTrustzone();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = message.getEndian();
  if (f !== 0.0) {
    writer.writeEnum(
      3,
      f
    );
  }
  f = message.getDsp();
  if (f !== 0.0) {
    writer.writeEnum(
      4,
      f
    );
  }
  f = message.getMve();
  if (f !== 0.0) {
    writer.writeEnum(
      5,
      f
    );
  }
  f = message.getBranchProtection();
  if (f !== 0.0) {
    writer.writeEnum(
      6,
      f
    );
  }
};


/**
 * optional Fpu fpu = 1;
 * @return {!proto.solutions.Fpu}
 */
proto.solutions.ProcessorData.prototype.getFpu = function() {
  return /** @type {!proto.solutions.Fpu} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {!proto.solutions.Fpu} value
 * @return {!proto.solutions.ProcessorData} returns this
 */
proto.solutions.ProcessorData.prototype.setFpu = function(value) {
  return jspb.Message.setProto3EnumField(this, 1, value);
};


/**
 * optional Trustzone trustzone = 2;
 * @return {!proto.solutions.Trustzone}
 */
proto.solutions.ProcessorData.prototype.getTrustzone = function() {
  return /** @type {!proto.solutions.Trustzone} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.solutions.Trustzone} value
 * @return {!proto.solutions.ProcessorData} returns this
 */
proto.solutions.ProcessorData.prototype.setTrustzone = function(value) {
  return jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * optional Endian endian = 3;
 * @return {!proto.solutions.Endian}
 */
proto.solutions.ProcessorData.prototype.getEndian = function() {
  return /** @type {!proto.solutions.Endian} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {!proto.solutions.Endian} value
 * @return {!proto.solutions.ProcessorData} returns this
 */
proto.solutions.ProcessorData.prototype.setEndian = function(value) {
  return jspb.Message.setProto3EnumField(this, 3, value);
};


/**
 * optional Dsp dsp = 4;
 * @return {!proto.solutions.Dsp}
 */
proto.solutions.ProcessorData.prototype.getDsp = function() {
  return /** @type {!proto.solutions.Dsp} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {!proto.solutions.Dsp} value
 * @return {!proto.solutions.ProcessorData} returns this
 */
proto.solutions.ProcessorData.prototype.setDsp = function(value) {
  return jspb.Message.setProto3EnumField(this, 4, value);
};


/**
 * optional Mve mve = 5;
 * @return {!proto.solutions.Mve}
 */
proto.solutions.ProcessorData.prototype.getMve = function() {
  return /** @type {!proto.solutions.Mve} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {!proto.solutions.Mve} value
 * @return {!proto.solutions.ProcessorData} returns this
 */
proto.solutions.ProcessorData.prototype.setMve = function(value) {
  return jspb.Message.setProto3EnumField(this, 5, value);
};


/**
 * optional BranchProtection branch_protection = 6;
 * @return {!proto.solutions.BranchProtection}
 */
proto.solutions.ProcessorData.prototype.getBranchProtection = function() {
  return /** @type {!proto.solutions.BranchProtection} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/**
 * @param {!proto.solutions.BranchProtection} value
 * @return {!proto.solutions.ProcessorData} returns this
 */
proto.solutions.ProcessorData.prototype.setBranchProtection = function(value) {
  return jspb.Message.setProto3EnumField(this, 6, value);
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.Compiler.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.Compiler.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.Compiler} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.Compiler.toObject = function(includeInstance, msg) {
  var f, obj = {
    name: jspb.Message.getFieldWithDefault(msg, 1, 0),
    version: jspb.Message.getFieldWithDefault(msg, 2, "")
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
 * @return {!proto.solutions.Compiler}
 */
proto.solutions.Compiler.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.Compiler;
  return proto.solutions.Compiler.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.Compiler} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.Compiler}
 */
proto.solutions.Compiler.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!proto.solutions.Compiler.Name} */ (reader.readEnum());
      msg.setName(value);
      break;
    case 2:
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
proto.solutions.Compiler.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.Compiler.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.Compiler} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.Compiler.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getName();
  if (f !== 0.0) {
    writer.writeEnum(
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
};


/**
 * @enum {number}
 */
proto.solutions.Compiler.Name = {
  GCC: 0,
  AC6: 1,
  IAR: 2,
  CLANG: 3
};

/**
 * optional Name name = 1;
 * @return {!proto.solutions.Compiler.Name}
 */
proto.solutions.Compiler.prototype.getName = function() {
  return /** @type {!proto.solutions.Compiler.Name} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {!proto.solutions.Compiler.Name} value
 * @return {!proto.solutions.Compiler} returns this
 */
proto.solutions.Compiler.prototype.setName = function(value) {
  return jspb.Message.setProto3EnumField(this, 1, value);
};


/**
 * optional string version = 2;
 * @return {string}
 */
proto.solutions.Compiler.prototype.getVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.Compiler} returns this
 */
proto.solutions.Compiler.prototype.setVersion = function(value) {
  return jspb.Message.setField(this, 2, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.solutions.Compiler} returns this
 */
proto.solutions.Compiler.prototype.clearVersion = function() {
  return jspb.Message.setField(this, 2, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.Compiler.prototype.hasVersion = function() {
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.BoardReference.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.BoardReference.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.BoardReference} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.BoardReference.toObject = function(includeInstance, msg) {
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
 * @return {!proto.solutions.BoardReference}
 */
proto.solutions.BoardReference.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.BoardReference;
  return proto.solutions.BoardReference.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.BoardReference} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.BoardReference}
 */
proto.solutions.BoardReference.deserializeBinaryFromReader = function(msg, reader) {
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
proto.solutions.BoardReference.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.BoardReference.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.BoardReference} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.BoardReference.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getName();
  if (f.length > 0) {
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
proto.solutions.BoardReference.prototype.getName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.BoardReference} returns this
 */
proto.solutions.BoardReference.prototype.setName = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string vendor = 2;
 * @return {string}
 */
proto.solutions.BoardReference.prototype.getVendor = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.BoardReference} returns this
 */
proto.solutions.BoardReference.prototype.setVendor = function(value) {
  return jspb.Message.setField(this, 2, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.solutions.BoardReference} returns this
 */
proto.solutions.BoardReference.prototype.clearVendor = function() {
  return jspb.Message.setField(this, 2, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.BoardReference.prototype.hasVendor = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional string revision = 3;
 * @return {string}
 */
proto.solutions.BoardReference.prototype.getRevision = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.solutions.BoardReference} returns this
 */
proto.solutions.BoardReference.prototype.setRevision = function(value) {
  return jspb.Message.setField(this, 3, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.solutions.BoardReference} returns this
 */
proto.solutions.BoardReference.prototype.clearRevision = function() {
  return jspb.Message.setField(this, 3, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.BoardReference.prototype.hasRevision = function() {
  return jspb.Message.getField(this, 3) != null;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.solutions.LayerData.repeatedFields_ = [2,3];



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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.LayerData.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.LayerData.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.LayerData} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.LayerData.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: (f = msg.getId()) && proto.solutions.LayerId.toObject(includeInstance, f),
    componentsList: jspb.Message.toObjectList(msg.getComponentsList(),
    proto.solutions.ComponentData.toObject, includeInstance),
    packsList: jspb.Message.toObjectList(msg.getPacksList(),
    proto.solutions.PackData.toObject, includeInstance),
    board: (f = msg.getBoard()) && proto.solutions.BoardReference.toObject(includeInstance, f),
    compiler: (f = msg.getCompiler()) && proto.solutions.Compiler.toObject(includeInstance, f),
    device: (f = msg.getDevice()) && proto.solutions.Device.toObject(includeInstance, f),
    processor: (f = msg.getProcessor()) && proto.solutions.ProcessorData.toObject(includeInstance, f)
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
 * @return {!proto.solutions.LayerData}
 */
proto.solutions.LayerData.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.LayerData;
  return proto.solutions.LayerData.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.LayerData} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.LayerData}
 */
proto.solutions.LayerData.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.LayerId;
      reader.readMessage(value,proto.solutions.LayerId.deserializeBinaryFromReader);
      msg.setId(value);
      break;
    case 2:
      var value = new proto.solutions.ComponentData;
      reader.readMessage(value,proto.solutions.ComponentData.deserializeBinaryFromReader);
      msg.addComponents(value);
      break;
    case 3:
      var value = new proto.solutions.PackData;
      reader.readMessage(value,proto.solutions.PackData.deserializeBinaryFromReader);
      msg.addPacks(value);
      break;
    case 4:
      var value = new proto.solutions.BoardReference;
      reader.readMessage(value,proto.solutions.BoardReference.deserializeBinaryFromReader);
      msg.setBoard(value);
      break;
    case 5:
      var value = new proto.solutions.Compiler;
      reader.readMessage(value,proto.solutions.Compiler.deserializeBinaryFromReader);
      msg.setCompiler(value);
      break;
    case 6:
      var value = new proto.solutions.Device;
      reader.readMessage(value,proto.solutions.Device.deserializeBinaryFromReader);
      msg.setDevice(value);
      break;
    case 7:
      var value = new proto.solutions.ProcessorData;
      reader.readMessage(value,proto.solutions.ProcessorData.deserializeBinaryFromReader);
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
proto.solutions.LayerData.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.LayerData.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.LayerData} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.LayerData.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.LayerId.serializeBinaryToWriter
    );
  }
  f = message.getComponentsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      2,
      f,
      proto.solutions.ComponentData.serializeBinaryToWriter
    );
  }
  f = message.getPacksList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      proto.solutions.PackData.serializeBinaryToWriter
    );
  }
  f = message.getBoard();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.solutions.BoardReference.serializeBinaryToWriter
    );
  }
  f = message.getCompiler();
  if (f != null) {
    writer.writeMessage(
      5,
      f,
      proto.solutions.Compiler.serializeBinaryToWriter
    );
  }
  f = message.getDevice();
  if (f != null) {
    writer.writeMessage(
      6,
      f,
      proto.solutions.Device.serializeBinaryToWriter
    );
  }
  f = message.getProcessor();
  if (f != null) {
    writer.writeMessage(
      7,
      f,
      proto.solutions.ProcessorData.serializeBinaryToWriter
    );
  }
};


/**
 * optional LayerId id = 1;
 * @return {?proto.solutions.LayerId}
 */
proto.solutions.LayerData.prototype.getId = function() {
  return /** @type{?proto.solutions.LayerId} */ (
    jspb.Message.getWrapperField(this, proto.solutions.LayerId, 1));
};


/**
 * @param {?proto.solutions.LayerId|undefined} value
 * @return {!proto.solutions.LayerData} returns this
*/
proto.solutions.LayerData.prototype.setId = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.LayerData} returns this
 */
proto.solutions.LayerData.prototype.clearId = function() {
  return this.setId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.LayerData.prototype.hasId = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * repeated ComponentData components = 2;
 * @return {!Array<!proto.solutions.ComponentData>}
 */
proto.solutions.LayerData.prototype.getComponentsList = function() {
  return /** @type{!Array<!proto.solutions.ComponentData>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.solutions.ComponentData, 2));
};


/**
 * @param {!Array<!proto.solutions.ComponentData>} value
 * @return {!proto.solutions.LayerData} returns this
*/
proto.solutions.LayerData.prototype.setComponentsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 2, value);
};


/**
 * @param {!proto.solutions.ComponentData=} opt_value
 * @param {number=} opt_index
 * @return {!proto.solutions.ComponentData}
 */
proto.solutions.LayerData.prototype.addComponents = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 2, opt_value, proto.solutions.ComponentData, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.LayerData} returns this
 */
proto.solutions.LayerData.prototype.clearComponentsList = function() {
  return this.setComponentsList([]);
};


/**
 * repeated PackData packs = 3;
 * @return {!Array<!proto.solutions.PackData>}
 */
proto.solutions.LayerData.prototype.getPacksList = function() {
  return /** @type{!Array<!proto.solutions.PackData>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.solutions.PackData, 3));
};


/**
 * @param {!Array<!proto.solutions.PackData>} value
 * @return {!proto.solutions.LayerData} returns this
*/
proto.solutions.LayerData.prototype.setPacksList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.solutions.PackData=} opt_value
 * @param {number=} opt_index
 * @return {!proto.solutions.PackData}
 */
proto.solutions.LayerData.prototype.addPacks = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.solutions.PackData, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.LayerData} returns this
 */
proto.solutions.LayerData.prototype.clearPacksList = function() {
  return this.setPacksList([]);
};


/**
 * optional BoardReference board = 4;
 * @return {?proto.solutions.BoardReference}
 */
proto.solutions.LayerData.prototype.getBoard = function() {
  return /** @type{?proto.solutions.BoardReference} */ (
    jspb.Message.getWrapperField(this, proto.solutions.BoardReference, 4));
};


/**
 * @param {?proto.solutions.BoardReference|undefined} value
 * @return {!proto.solutions.LayerData} returns this
*/
proto.solutions.LayerData.prototype.setBoard = function(value) {
  return jspb.Message.setWrapperField(this, 4, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.LayerData} returns this
 */
proto.solutions.LayerData.prototype.clearBoard = function() {
  return this.setBoard(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.LayerData.prototype.hasBoard = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional Compiler compiler = 5;
 * @return {?proto.solutions.Compiler}
 */
proto.solutions.LayerData.prototype.getCompiler = function() {
  return /** @type{?proto.solutions.Compiler} */ (
    jspb.Message.getWrapperField(this, proto.solutions.Compiler, 5));
};


/**
 * @param {?proto.solutions.Compiler|undefined} value
 * @return {!proto.solutions.LayerData} returns this
*/
proto.solutions.LayerData.prototype.setCompiler = function(value) {
  return jspb.Message.setWrapperField(this, 5, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.LayerData} returns this
 */
proto.solutions.LayerData.prototype.clearCompiler = function() {
  return this.setCompiler(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.LayerData.prototype.hasCompiler = function() {
  return jspb.Message.getField(this, 5) != null;
};


/**
 * optional Device device = 6;
 * @return {?proto.solutions.Device}
 */
proto.solutions.LayerData.prototype.getDevice = function() {
  return /** @type{?proto.solutions.Device} */ (
    jspb.Message.getWrapperField(this, proto.solutions.Device, 6));
};


/**
 * @param {?proto.solutions.Device|undefined} value
 * @return {!proto.solutions.LayerData} returns this
*/
proto.solutions.LayerData.prototype.setDevice = function(value) {
  return jspb.Message.setWrapperField(this, 6, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.LayerData} returns this
 */
proto.solutions.LayerData.prototype.clearDevice = function() {
  return this.setDevice(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.LayerData.prototype.hasDevice = function() {
  return jspb.Message.getField(this, 6) != null;
};


/**
 * optional ProcessorData processor = 7;
 * @return {?proto.solutions.ProcessorData}
 */
proto.solutions.LayerData.prototype.getProcessor = function() {
  return /** @type{?proto.solutions.ProcessorData} */ (
    jspb.Message.getWrapperField(this, proto.solutions.ProcessorData, 7));
};


/**
 * @param {?proto.solutions.ProcessorData|undefined} value
 * @return {!proto.solutions.LayerData} returns this
*/
proto.solutions.LayerData.prototype.setProcessor = function(value) {
  return jspb.Message.setWrapperField(this, 7, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.LayerData} returns this
 */
proto.solutions.LayerData.prototype.clearProcessor = function() {
  return this.setProcessor(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.LayerData.prototype.hasProcessor = function() {
  return jspb.Message.getField(this, 7) != null;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.solutions.IncludedLayer.repeatedFields_ = [2,3];



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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.IncludedLayer.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.IncludedLayer.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.IncludedLayer} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.IncludedLayer.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: (f = msg.getId()) && proto.solutions.LayerId.toObject(includeInstance, f),
    forContextsList: jspb.Message.toObjectList(msg.getForContextsList(),
    proto.solutions.BuildContext.toObject, includeInstance),
    notForContextsList: jspb.Message.toObjectList(msg.getNotForContextsList(),
    proto.solutions.BuildContext.toObject, includeInstance)
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
 * @return {!proto.solutions.IncludedLayer}
 */
proto.solutions.IncludedLayer.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.IncludedLayer;
  return proto.solutions.IncludedLayer.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.IncludedLayer} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.IncludedLayer}
 */
proto.solutions.IncludedLayer.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.LayerId;
      reader.readMessage(value,proto.solutions.LayerId.deserializeBinaryFromReader);
      msg.setId(value);
      break;
    case 2:
      var value = new proto.solutions.BuildContext;
      reader.readMessage(value,proto.solutions.BuildContext.deserializeBinaryFromReader);
      msg.addForContexts(value);
      break;
    case 3:
      var value = new proto.solutions.BuildContext;
      reader.readMessage(value,proto.solutions.BuildContext.deserializeBinaryFromReader);
      msg.addNotForContexts(value);
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
proto.solutions.IncludedLayer.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.IncludedLayer.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.IncludedLayer} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.IncludedLayer.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.LayerId.serializeBinaryToWriter
    );
  }
  f = message.getForContextsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      2,
      f,
      proto.solutions.BuildContext.serializeBinaryToWriter
    );
  }
  f = message.getNotForContextsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      proto.solutions.BuildContext.serializeBinaryToWriter
    );
  }
};


/**
 * optional LayerId id = 1;
 * @return {?proto.solutions.LayerId}
 */
proto.solutions.IncludedLayer.prototype.getId = function() {
  return /** @type{?proto.solutions.LayerId} */ (
    jspb.Message.getWrapperField(this, proto.solutions.LayerId, 1));
};


/**
 * @param {?proto.solutions.LayerId|undefined} value
 * @return {!proto.solutions.IncludedLayer} returns this
*/
proto.solutions.IncludedLayer.prototype.setId = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.IncludedLayer} returns this
 */
proto.solutions.IncludedLayer.prototype.clearId = function() {
  return this.setId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.IncludedLayer.prototype.hasId = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * repeated BuildContext for_contexts = 2;
 * @return {!Array<!proto.solutions.BuildContext>}
 */
proto.solutions.IncludedLayer.prototype.getForContextsList = function() {
  return /** @type{!Array<!proto.solutions.BuildContext>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.solutions.BuildContext, 2));
};


/**
 * @param {!Array<!proto.solutions.BuildContext>} value
 * @return {!proto.solutions.IncludedLayer} returns this
*/
proto.solutions.IncludedLayer.prototype.setForContextsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 2, value);
};


/**
 * @param {!proto.solutions.BuildContext=} opt_value
 * @param {number=} opt_index
 * @return {!proto.solutions.BuildContext}
 */
proto.solutions.IncludedLayer.prototype.addForContexts = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 2, opt_value, proto.solutions.BuildContext, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.IncludedLayer} returns this
 */
proto.solutions.IncludedLayer.prototype.clearForContextsList = function() {
  return this.setForContextsList([]);
};


/**
 * repeated BuildContext not_for_contexts = 3;
 * @return {!Array<!proto.solutions.BuildContext>}
 */
proto.solutions.IncludedLayer.prototype.getNotForContextsList = function() {
  return /** @type{!Array<!proto.solutions.BuildContext>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.solutions.BuildContext, 3));
};


/**
 * @param {!Array<!proto.solutions.BuildContext>} value
 * @return {!proto.solutions.IncludedLayer} returns this
*/
proto.solutions.IncludedLayer.prototype.setNotForContextsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.solutions.BuildContext=} opt_value
 * @param {number=} opt_index
 * @return {!proto.solutions.BuildContext}
 */
proto.solutions.IncludedLayer.prototype.addNotForContexts = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.solutions.BuildContext, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.solutions.IncludedLayer} returns this
 */
proto.solutions.IncludedLayer.prototype.clearNotForContextsList = function() {
  return this.setNotForContextsList([]);
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
 *     https://goto/soy-param-migration
 * @return {!Object}
 */
proto.solutions.DefaultConfigurationData.prototype.toObject = function(opt_includeInstance) {
  return proto.solutions.DefaultConfigurationData.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     https://goto/soy-param-migration
 * @param {!proto.solutions.DefaultConfigurationData} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.DefaultConfigurationData.toObject = function(includeInstance, msg) {
  var f, obj = {
    compiler: (f = msg.getCompiler()) && proto.solutions.Compiler.toObject(includeInstance, f)
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
 * @return {!proto.solutions.DefaultConfigurationData}
 */
proto.solutions.DefaultConfigurationData.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.solutions.DefaultConfigurationData;
  return proto.solutions.DefaultConfigurationData.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.solutions.DefaultConfigurationData} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.solutions.DefaultConfigurationData}
 */
proto.solutions.DefaultConfigurationData.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.solutions.Compiler;
      reader.readMessage(value,proto.solutions.Compiler.deserializeBinaryFromReader);
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
proto.solutions.DefaultConfigurationData.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.solutions.DefaultConfigurationData.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.solutions.DefaultConfigurationData} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.solutions.DefaultConfigurationData.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getCompiler();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.solutions.Compiler.serializeBinaryToWriter
    );
  }
};


/**
 * optional Compiler compiler = 1;
 * @return {?proto.solutions.Compiler}
 */
proto.solutions.DefaultConfigurationData.prototype.getCompiler = function() {
  return /** @type{?proto.solutions.Compiler} */ (
    jspb.Message.getWrapperField(this, proto.solutions.Compiler, 1));
};


/**
 * @param {?proto.solutions.Compiler|undefined} value
 * @return {!proto.solutions.DefaultConfigurationData} returns this
*/
proto.solutions.DefaultConfigurationData.prototype.setCompiler = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.solutions.DefaultConfigurationData} returns this
 */
proto.solutions.DefaultConfigurationData.prototype.clearCompiler = function() {
  return this.setCompiler(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.solutions.DefaultConfigurationData.prototype.hasCompiler = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * @enum {number}
 */
proto.solutions.Fpu = {
  FPU_UNSPECIFIED: 0,
  FPU_SP: 1,
  FPU_DP: 2,
  FPU_OFF: 3
};

/**
 * @enum {number}
 */
proto.solutions.Trustzone = {
  TRUSTZONE_UNSPECIFIED: 0,
  TRUSTZONE_SECURE: 1,
  TRUSTZONE_NON_SECURE: 2,
  TRUSTZONE_OFF: 3
};

/**
 * @enum {number}
 */
proto.solutions.Endian = {
  ENDIAN_UNSPECIFIED: 0,
  ENDIAN_LITTLE: 1,
  ENDIAN_BIG: 2
};

/**
 * @enum {number}
 */
proto.solutions.Dsp = {
  DSP_UNSPECIFIED: 0,
  DSP_ON: 1,
  DSP_OFF: 2
};

/**
 * @enum {number}
 */
proto.solutions.Mve = {
  MVE_UNSPECIFIED: 0,
  MVE_FP: 1,
  MVE_INT: 2,
  MVE_OFF: 3
};

/**
 * @enum {number}
 */
proto.solutions.BranchProtection = {
  BRANCH_PROTECTION_UNSPECIFIED: 0,
  BRANCH_PROTECTION_BTI: 1,
  BRANCH_PROTECTION_BTI_SIGNRET: 2,
  BRANCH_PROTECTION_OFF: 3
};

goog.object.extend(exports, proto.solutions);
