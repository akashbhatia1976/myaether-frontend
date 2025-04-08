Pod::Spec.new do |s|
  s.name         = "ReactCodegen"
  s.version      = "1.0.0"
  s.summary      = "React Native Codegen for iOS"
  s.author       = "Meta Platforms, Inc. and affiliates"
  s.license      = { :type => "MIT" }
  s.homepage     = "https://reactnative.dev/"
  s.platforms    = { :ios => "12.0" }
  s.source       = { :git => "https://github.com/facebook/react-native.git" }

  s.source_files  = "**/*.{h,mm,cpp}"
  s.public_header_files = "**/*.h" # ✅ Expose headers publicly
  s.header_mappings_dir = "."

  s.pod_target_xcconfig = {
    'HEADER_SEARCH_PATHS' => '"$(PODS_ROOT)/Headers/Public/**" ' \
                             '"$(PODS_ROOT)/../build/generated/ios/**" ' \
                             '"$(PODS_ROOT)/../node_modules/react-native/React/**" ' \
                             '"$(PODS_ROOT)/../node_modules/react-native/ReactCommon/**" ' \
                             '"$(PODS_ROOT)/../node_modules/react-native/ReactCommon/cxxreact/**" ' \
                             '"$(PODS_ROOT)/../node_modules/react-native/Libraries/**" ' \
                             '"$(PODS_ROOT)/../node_modules/react-native/Libraries/Required/**"',
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++20'
  }


  s.requires_arc = true
end

