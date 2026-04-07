// Test cases for Config Wizard
// Use to quickly test features

//-------- <<< Use Configuration Wizard in Context Menu >>> --------------------

//   <o0.8..15>ISR FIFO Queue
//      <4=>  4 entries    <8=>   8 entries   <12=>  12 entries   <16=>  16 entries
//     <24=> 24 entries   <32=>  32 entries   <48=>  48 entries   <64=>  64 entries
//     <96=> 96 entries  <128=> 128 entries  <196=> 196 entries  <256=> 256 entries
//   <i> RTOS Functions called from ISR store requests to this buffer.
//   <i> Default: 16 entries
#ifndef OS_ISR_FIFO_QUEUE
#define OS_ISR_FIFO_QUEUE           0x00
#endif


// <<< end of configuration section >>>



//   <e0.0>Interface Association
//   <i>Used for grouping of multiple interfaces to a single class.
#define USBD_CUSTOM_CLASS1_IAD_EN                                  0
// </e>

// <h>Config Wizard Test
//   <h>Config Section 0
//   <y>Define 0
//   <i>VS Code: This is expected to set DEFINE_0 to a numeric value or symbol
//   <i>uVision: This is expected to set DEFINE_0 to a symbol only (numeric value is not taken into account)
#define DEFINE_0                        0

//   <o.0>Option 1
#define DEFINE_1                        0
//   </h>

// <y DEFINE_2>Define 2
// <i> This is expected to set DEFINE_2 to a value or symbol
#define DEFINE_2                        fjskfbk

// <o> Define 3 <1-10>
// <i> This is expected to set DEFINE_3 to a numeric value in a range [1:10]
#define DEFINE_3                        1


#define A  "<<< end of configuration section >>>"

// <h>Config Wizard Test
//   <h>Config Section 0
//   <y>Define 0
//   <i>VS Code: This is expected to set DEFINE_0 to a numeric value or symbol
//   <i>uVision: This is expected to set DEFINE_0 to a symbol only (numeric value is not taken into account)
#define DEFINE_0                        0

//   <o.0>Option 1
#define DEFINE_1                        0
//   </h>

// <<< end of configuration section >>>

// <y DEFINE_2>Define 2
// <i> This is expected to set DEFINE_2 to a value or symbol
#define DEFINE_2                        0

// <o> Define 3 <1-10>
// <i> This is expected to set DEFINE_3 to a numeric value in a range [1:10]
#define DEFINE_3                        1




//   <y1>Maximum number of open files <1-16>
//   <i>Define number of files that can be opened at the same time.
//   <i>Default: 4
#define FAT_MAX_OPEN_FILES      (minFiles, maxFiles)


//   <y>Value or Define Symbol that specifies number of open files <1-16>
//   <i>Define number of files that can be opened at the same time.
//   <i>Default: 4
#define FAT_MAX_OPEN_FILES      maxFiles

//   <y>Minimum number of open files <1-16>
//   <i>Define number of files that can be opened at the same time.
//   <i>Default: 4
//   <y1>Maximum number of open files <1-16>
//   <i>Define number of files that can be opened at the same time.
//   <i>Default: 4
#define FAT_MAX_OPEN_FILES      (minFiles, maxFiles)

//   <y FAT_MAX_OPEN_FILES>Value or Define Symbol that specifies number of open files <1-16>
//   <i>Define number of files that can be opened at the same time.
//   <i>Default: 4
#define FAT_MAX_OPEN_FILES      maxFiles2











// <h> Test Heading
// <i> Info Text
// <n> Notification Text
// </h>

// <n>Device pack:   ARM::V2M_MPS3_SSE_300_BSP@1.5.0
// <i>Device pack used to generate this file

// <h>ROM Configuration
// =======================
// <h> IROM1=__ROM0
//   <o> Base address <0x0-0xFFFFFFFF:8>
//   <i> Defines base address of memory region.
//   <i> Default: 0x10000000
#define __ROM0_BASE 0x10000000
//   <o> Region size [bytes] <0x0-0xFFFFFFFF:8>
//   <i> Defines size of memory region.
//   <i> Default: 0x00200000
#define __ROM0_SIZE 0x00200000
//   <q>Default region
//   <i> Enables memory region globally for the application.
#define __ROM0_DEFAULT 1
//   <q>Startup
//   <i> Selects region to be used for startup code.
#define __ROM0_STARTUP 1
// </h>

// </h>


//   <y1>Maximum number of open files <1-16>
//   <i>Define number of files that can be opened at the same time.
//   <i>Default: 4
#define FAT_MAX_OPEN_FILES      (minFiles, maxFiles)


//   <y>Value or Define Symbol that specifies number of open files <1-16>
//   <i>Define number of files that can be opened at the same time.
//   <i>Default: 4
#define FAT_MAX_OPEN_FILES      maxFiles

//   <y>Minimum number of open files <1-16>
//   <i>Define number of files that can be opened at the same time.
//   <i>Default: 4
//   <y1>Maximum number of open files <1-16>
//   <i>Define number of files that can be opened at the same time.
//   <i>Default: 4
#define FAT_MAX_OPEN_FILES      (minFiles, maxFiles)

//   <y FAT_MAX_OPEN_FILES>Value or Define Symbol that specifies number of open files <1-16>
//   <i>Define number of files that can be opened at the same time.
//   <i>Default: 4
#define FAT_MAX_OPEN_FILES      maxFiles2

//   <o0> Test 1
#define OS_DYNAMIC_MEM_SIZE        7

//   <o0> Test 1
//   <o1> Test 2
//   <o2> Test 3
//   <o3> Test 4
#define OS_DYNAMIC_MEM_SIZE         (64U+0x41U*(34U+2))

//   <o redPortMode> Red port mode
//     <OutPushPull_GPIO=>  PushPull
//     <OutOpenDrain_GPIO=> OpenDrain
//     <OutOpenDrain_FOO=> Foo
//     <OutOpenDrain_BAR=> Bar
//   <i>Selects GPIO output
ledConf.redPortMode = OutPushPull_GPIO;


// <c> Enable Code Block
//  <i> Comment sequence block until block end when disabled
   //foo  // comment
       //+bar // other comment
   //-xFoo
                //xxx
// </c>


//   <o0> Test 1
//   <o1> Test 2
//   <o2> Test 3
//   <o3> Test 4
#define OS_DYNAMIC_MEM_SIZE         (64U+0x41U*(34U+2))

// <o> Option
#define val 0x12abCd3eFU

//  <s.10>Manufacturer String
//  <i>String Descriptor describing Manufacturer.
#define USBD0_STR_DESC_MAN              L"Keil Software"

// <o> Option
#define val -0x02

// <o>Default Thread stack size [bytes] <64-4096:8><#/4>
// <i> Defines default stack size for threads with osThreadDef stacksz = 0
// <i> Default: 200
#ifndef OS_STKSIZE
#define OS_STKSIZE 50
#endif

// <o.8..15> Option  <0x00-0xff:1><#+1>
#define val 0x00000f8ff

// <o> Option
// <o.0..3> Option 0..3 <1-4:2>
// <o.4..7> Option 4..7
// <o.8..16> Option 8..16
// <o.8..16> Option 8..16
// <o.17> Option 17
// <o.18..23> Option 18..23
// <o.24..31> Option 24..31
#define val 0x00007679

//   <o0.8..15>ISR FIFO Queue
//      <4=>  4 entries    <8=>   8 entries   <12=>  12 entries   <16=>  16 entries
//     <24=> 24 entries   <32=>  32 entries   <48=>  48 entries   <64=>  64 entries
//     <96=> 96 entries  <128=> 128 entries  <196=> 196 entries  <256=> 256 entries
//   <i> RTOS Functions called from ISR store requests to this buffer.
//   <i> Default: 16 entries
#ifndef OS_ISR_FIFO_QUEUE
#define OS_ISR_FIFO_QUEUE           0xffffffff
#endif


// <e> Test HeadingEnable
// </e>
#define ena 0x00000000


//   <o redPortMode> Red port mode
//     <OutPushPull_GPIO=>  PushPull
//     <OutOpenDrain_GPIO=> OpenDrain
//   <i>Selects GPIO output
ledConf.redPortMode = OutOpenDrain_GPIO;


// <c> Enable Code Block
//  <i> Comment sequence block until block end when disabled
   //foo  // comment
       //+bar // other comment
   //-xFoo
                //xxx
// </c>

// <!c> Disable Code Block
//  <i> Comment sequence block until block end when disabled
   //foo  // comment
       //+bar // other comment
   //-xFoo
                //xxx
// </c>

//   <o>Global Dynamic Memory size [bytes] <0-1073741824:8> <f.d>
//   <i> Defines the combined global dynamic memory size.
//   <i> Default: 4096
#ifndef OS_DYNAMIC_MEM_SIZE
#define OS_DYNAMIC_MEM_SIZE         0x2000
//#define OS_DYNAMIC_MEM_SIZE2        0x1234
#endif

//         <s0.126> String 1
//         <s1.126> String 2
#define STR L"barfoo" /* comment "xxx" */  L"BAR"

//         <s1.126> String 4
#define STR1 L"test" // comment "xxx"
//#define STR2 L"next line commented"
//#define STR2 L"next line"

//   <o>ISR FIFO Queue
//      <4=>  4 entries    <8=>   8 entries   <12=>  12 entries   <16=>  16 entries
//     <24=> 24 entries   <32=>  32 entries   <48=>  48 entries   <64=>  64 entries
//     <96=> 96 entries  <128=> 128 entries  <196=> 196 entries  <256=> 256 entries
//   <i> RTOS Functions called from ISR store requests to this buffer.
//   <i> Default: 16 entries
#ifndef OS_ISR_FIFO_QUEUE
#define OS_ISR_FIFO_QUEUE           16
#endif

// <h>String Configuration
// =======================
//         <s0.126> String 1
#define STR L"foo" /* comment "xxx" */  L"BAR"
// <h>String2 Configuration
// =======================
//         <s0.126> String 1
#define STR L"foo" /* comment "xxx" */  L"BAR"
// </h>

// <h>String4 Configuration
// =======================
//         <s0.126> String 1
#define STR L"foo" /* comment "xxx" */  L"BAR"
// </h>
// </h>

//  <a PUBLIC_KEY> Public key for signing <0..255> <f.h>
//  <d> {0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00}
#define PUBLIC_KEY  {0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F}

//   <o>Timer Thread Priority
//   <i> Defines priority for Timer Thread
//   <i> Default: High
//   <d> 5

//   <o>Timer Thread Priority
//                        <1=> Low
//     <2=> Below Normal  <3=> Normal  <4=> Above Normal
//                        <5=> High
//                        <6=> Realtime (highest)
//   <i> Defines priority for Timer Thread
//   <i> Default: High
//   <d> 5


// <h> Test Heading
// </h>
// <e> Test HeadingEnable
// </e>
// <e2> Test HeadingEnable skip
// </e>
// <e.2> Test HeadingEnable bit
// </e>
// <e2.3> Test HeadingEnable skip bit
// </e>

// <h> Test Heading
// <i> Info Text
// <n> Notification Text
// </h>

// <d> 42
// <d> DEFAULT

// <c> Enable Code
// </c>
// <!c> Disable code
// </c>

// <q> Option (Bit)
// <q3.2> Option (Bit)
// <o> Option
// <o1.2> Option
// <o2.4..8> Option
// <o MODE> Operation Mode
// <o MODE42> Operation Mode

// <o2>Skip 2 and modify the third item after this entry <1-9>
// <o MODIFY_THIS>Modify the item after "MODIFY_THIS" <1-9>

// <h> Test Heading
// <o2>Skip 2 and modify the third item after this entry <1-9>
// <o MODIFY_THIS>Modify the item after "MODIFY_THIS" <1-9>
// <i> Info Text
// <n> Notification Text
// </h>


// <e0.1>System Configuration
// =======================

//   <o>Timer Thread Priority
//                        <1=> Low
//     <2=> Below Normal  <3=> Normal  <4=> Above Normal
//                        <5=> High
//                        <6=> Realtime (highest)
//   <i> Defines priority for Timer Thread
//   <i> Default: High
//   <d> 5
#ifndef OS_TIMERPRIO
#define OS_TIMERPRIO   0
#endif

// <o MODIFY_THIS>Modify the item after "MODIFY_THIS" <1-9>
#define VALUE1       1000
#define VALUE2       2000
#define MODIFY_THIS  3000

//   <o TIMESTAMP_SRC>Time Stamp Source
//      <dwt=>     DWT Cycle Counter
//      <systick=> SysTick
//      <user=>    User Timer
//   <i>Selects source for 32-bit time stamp
#define TIMESTAMP_SRC  dwt

//   <o redPortMode> Red port mode
//     <OutPushPull_GPIO=>  PushPull
//     <OutOpenDrain_GPIO=> OpenDrain
//   <i>Selects GPIO output
ledConf.redPortMode = OutOpenDrain_GPIO;

// <o>Default Thread stack size [bytes] <64-4096:8><#/4>
// <i> Defines default stack size for threads with osThreadDef stacksz = 0
// <i> Default: 200
#ifndef OS_STKSIZE
#define OS_STKSIZE 50
#endif


//   <o>Global Dynamic Memory size [bytes] <0-1073741824:8>
//   <i> Defines the combined global dynamic memory size.
//   <i> Default: 4096
#ifndef OS_DYNAMIC_MEM_SIZE
#define OS_DYNAMIC_MEM_SIZE         4096
#endif

//   </e>

//   <o>ISR FIFO Queue
//      <4=>  4 entries    <8=>   8 entries   <12=>  12 entries   <16=>  16 entries
//     <24=> 24 entries   <32=>  32 entries   <48=>  48 entries   <64=>  64 entries
//     <96=> 96 entries  <128=> 128 entries  <196=> 196 entries  <256=> 256 entries
//   <i> RTOS Functions called from ISR store requests to this buffer.
//   <i> Default: 16 entries
#ifndef OS_ISR_FIFO_QUEUE
#define OS_ISR_FIFO_QUEUE           16
#endif

//   <q>Object Memory usage counters
//   <i> Enables object memory usage counters (requires RTX source variant).
#ifndef OS_OBJ_MEM_USAGE
#define OS_OBJ_MEM_USAGE            0
#endif

// </e>

// <<< end of configuration section >>>




// Can be parsed, but incomplete (with errors)

// <0-3>
// <-0-3>
// <0x00-0x03>
// <-0x00--0x03>

// <0..3>
// <-0..3>
// <0x00..0x03>
// <-0x00..-0x03>
