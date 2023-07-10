import { IActionInTestCase } from "./rm-project-spec.types";

export function actionClear(page: string, element: string): IActionInTestCase {
  return {
    id: "",
    type: "testStep",
    page,
    element,
    action: "Clear",
    data: "",
  };
}
