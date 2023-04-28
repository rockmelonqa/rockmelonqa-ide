export enum ActionType {
  Clear = "Clear",
  Click = "Click",
  ClickPopup = "ClickPopup",
  ClosePopup = "ClosePopup",
  Delay = "Delay",
  GoToUrl = "GoToUrl",
  Input = "Input",
  InputByCode = "InputByCode",
  /** Run another test case */
  //Run = "Run",
  /** Run the provided code */
  RunCode = "RunCode",
  SelectOption = "SelectOption",
  VerifyAttribute = "VerifyAttribute",
  VerifyHasText = "VerifyHasText",
  VerifyHasValue = "VerifyHasValue",
  VerifyIsHidden = "VerifyIsHidden",
  VerifyIsVisible = "VerifyIsVisible",
  VerifyTitle = "VerifyTitle",
  VerifyTitleContain = "VerifyTitleContain",
  VerifyUrl = "VerifyUrl",
}
