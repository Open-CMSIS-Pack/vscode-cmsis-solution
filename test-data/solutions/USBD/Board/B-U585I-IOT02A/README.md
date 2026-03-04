Board: STMicroelectronics [B-U585I-IOT02A](https://www.st.com/en/evaluation-tools/b-u585i-iot02a.html)
------------------------------------------

Device: **STM32U585AII6QU**  
System Core Clock: **160 MHz**

This setup is configured using **STM32CubeMX**, an interactive tool provided by STMicroelectronics for device configuration.
Refer to ["Configure STM32 Devices with CubeMX"](https://open-cmsis-pack.github.io/cmsis-toolbox/CubeMX) for additional information.

### STM32CubeMX configuration
Start STM32CubeMX with default B-U585I-IOT02A board setup wihtout TrustZone and make the following changes:
1. Under **Pinout & Configuration** select **Categories - System Core - SYS**:
    - Select **TIM17** for **Timebase Source**
2. Under **Pinout & Configuration** select **Categories - System Core - NVIC**:
    - Under **NVIC** tab change:
      - **USART1 global interrupt - Enabled** to **checked**
    - Under **Code Generation** tab change:
      - **System service call via SWI instruction - Generate IRQ handler** to **unchecked**
      - **Pendable request for system service - Generate IRQ handler** to **unchecked**
      - **System tick timer - Generate IRQ handler** to **unchecked**
3. Under **Project Manager** select **Project**:
    - Under **Linker Settings** change:
      - **Minimum Heap Size** set **0x400**
      - **Minimum Stack Size** set **0x400**
4. Click on **GENERATE**

### System Configuration

**TrustZone** disabled (option bit TZEN=0)

| System resource         | Setting
|:------------------------|:--------------------------------------------
| Heap                    | 1 kB (configured in the STM32CubeMX)
| Stack (MSP)             | 1 kB (configured in the STM32CubeMX)

### STDIO mapping

**STDIO** is routed to Virtual COM port on the ST-Link (using USART1 peripheral)

### CMSIS-Driver mapping

| CMSIS-Driver  | Peripheral
|:--------------|:----------
| Driver_USBD0  | USB_OTG_FS

### CMSIS-Driver Virtual I/O mapping

| CMSIS-Driver VIO  | Physical resource
|:------------------|:-------------------------------
| vioBUTTON0        | Button USER (PC13)
| vioLED0           | LED RED (PH6)
| vioLED1           | LED GREEN (PH7)

## Board configuration

**Board setup**
  - Insure that the **5V_USB_STLK** and **JP3** jumpers are bridged and the remaining jumpers are not bridged
  - Check that the **BOOT0** DIP switch is in the **0** / right position (closest to the ST-LINK STLK CN8 USB connector)
  - Connect a **USB micro-B cable** between the **STLK** connector and your **Personal Computer**
