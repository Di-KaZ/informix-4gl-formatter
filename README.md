# Moussed's Informix 4gl Formatter

An informix 4gl formatter made in TypeScript that correct indentation with some extra features

## Preview :
### Before
![](img/preview_not_formatted.png)
Ugly isnt it ? 🤔

### Condition flag enabled
![](img/preview_condition.png)
ℹ I find the condition flag particuly handy has it permmit to just select the commented part and easily find the matching part and the block contained in it.

### Number flag enabled
![](img/preview_number.png)
⚠ number mode is not really acurate atm. I work on a better implementation

## Usage

|Flag|Optinal ?| Default| Description|
|:-:|:-:|:-:|:-:|
|-f \|\| -d | ❌ | no default | (filepath) or  (dirpath)|
|-i| ✔ |'\\t' | string to use as indentation|
|-o| ✔ |current dir| directory where to output files
|-l (none \|\| condition \|\| number)| ✔ |condition | Identation mode to use |

# Modes
- **none** display nothing
- **condition** display the first 40 char of the opening statement on the mathching intermediate & end statement
- **number** display the inner depth of the opening statement on the mathchingintermediate && end statement

# [Download it ! 😎](https://github.com/Di-KaZ/informix-4gl-formatter/releases/tag/0.0.7)


# If you want compile from source

```bash
yarn install && yarn build-exe
```

It is not perfect but it get the job done 😁

## Plan for future
- Add simple drag & drop graphical interface
- adapt it to a vscode formatter extention
- more edge case management
- more verbose error management

#**I hope it will help you in your journey, Enjoy !**
