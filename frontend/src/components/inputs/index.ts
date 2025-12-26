/**
 * Advanced Input Components
 *
 * Enhanced input components for better form UX including masked inputs,
 * color pickers, range sliders, tag inputs, and number inputs with controls.
 */

// Input Mask
export {
  InputMask,
  PhoneInput,
  DateMaskInput,
  TimeInput,
  CreditCardInput,
  MaskPatterns,
  type InputMaskProps,
} from './InputMask';

// Color Picker
export {
  ColorPicker,
  ColorSwatch,
  MaterialColors,
  type ColorPickerProps,
  type ColorSwatchProps,
} from './ColorPicker';

// Range Slider
export {
  RangeSlider,
  ValueSlider,
  TemperatureRangeSlider,
  HumidityRangeSlider,
  PercentageSlider,
  SliderPresets,
  type RangeSliderProps,
  type ValueSliderProps,
} from './RangeSlider';

// Tag Input
export {
  TagInput,
  AutocompleteTagInput,
  EmailTagInput,
  HashtagInput,
  KeywordInput,
  type TagInputProps,
  type AutocompleteTagInputProps,
} from './TagInput';

// Number Input
export {
  NumberInput,
  CurrencyInput,
  PercentageInput,
  TemperatureInput,
  CompactNumberInput,
  type NumberInputProps,
  type CurrencyInputProps,
  type TemperatureInputProps,
  type CompactNumberInputProps,
} from './NumberInput';
