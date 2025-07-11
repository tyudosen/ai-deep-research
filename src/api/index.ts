import { HttpApi } from "@effect/platform";
import { AuthApiGroup } from "./auth";
import { DeepResearchApiGroup } from "./deep-research";

export class Api extends HttpApi.make("DeepResearchApi")
	.add(DeepResearchApiGroup)
	.add(AuthApiGroup)
{ }
