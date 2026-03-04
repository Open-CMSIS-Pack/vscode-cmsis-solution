# USBD Middleware Example - User View

This a snapshot of an example taken from https://github.com/ARM-software/MDK-Middleware/tree/main/Examples
Might need to be updated in future.

This is the directory structure that a user should get when working with a MDK-Middleware example.

The Board layer is copied into a directory with the name `.\Board\B-U585I-IOT02A`.

## Workflow Issues

1. Initially the project does not have any target-types.  The message should hint the user towards it. Note that the message should refer to the target type.

```txt
  target-types:
#    - type: B-U585I-IOT02A
#      board: B-U585I-IOT02A
#      variables:
#       - Board-Layer: $SolutionDir()$\Board\B-U585I-IOT02A\Board.clayer.yml

#    - type: LPC55S69-EVK
#      board: LPC55S69-EVK


2. With Targets added, tool should detect the missing variable `Board-Layer` and search for compatible layers.

```txt
  target-types:
   - type: B-U585I-IOT02A          # type name identical with board name?
     board: B-U585I-IOT02A
     variables:
       - Board-Layer: $SolutionDir()$\Board\B-U585I-IOT02A\Board.clayer.yml
```

Once `variables:` are set, the user can compile using:

```
>cbuild USB_Device.csolution.yml --update-rte --context-set --toolchain AC6
```
