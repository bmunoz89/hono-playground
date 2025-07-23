import type { AppType } from "@app";
import env from "@env";
import { hc } from "hono/client";

const { api } = hc<AppType>(`http://localhost:${env.PORT}`);

const getMain = await api.main[":bar"][":baz"].$get({
  param: {
    bar: "foo",
    baz: "1",
  },
});
const getMainData = await getMain.json();
console.log("getMainData :>> ", getMainData);

const postMain = await api.main.$post({
  json: {
    bar: 4321,
    foo: "Hello world",
  },
});
const postMainData = await postMain.json();
console.log("postMainData :>> ", postMainData);

const getTest = await api.test.$get();
const getTestData = await getTest.json();
console.log("getTestData :>> ", getTestData);
