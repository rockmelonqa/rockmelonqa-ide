/** Test action type */
export enum ActionType {
  AddComment = "AddComment",
  Clear = "Clear",
  Click = "Click",
  ClickPopup = "ClickPopup",
  ClosePopup = "ClosePopup",
  Delay = "Delay",
  DblClick = "DblClick",
  GoToUrl = "GoToUrl",
  Input = "Input",
  InputByCode = "InputByCode",
  /** Run another test case */
  //Run = "Run",
  /** Run the provided code */
  RunCode = "RunCode",
  RunTestRoutine = "RunTestRoutine",
  SelectOption = "SelectOption",
  VerifyAttribute = "VerifyAttribute",
  VerifyHasText = "VerifyHasText",
  VerifyHasValue = "VerifyHasValue",
  VerifyIsEditable = "VerifyIsEditable",
  VerifyIsReadOnly = "VerifyIsReadOnly",
  VerifyIsHidden = "VerifyIsHidden",
  VerifyIsVisible = "VerifyIsVisible",
  VerifyTitle = "VerifyTitle",
  VerifyTitleContains = "VerifyTitleContains",
  VerifyUrl = "VerifyUrl",
}
