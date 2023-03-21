import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Payload } from "../types";
import { isValidUrl } from "../utils/isValidUrl";

export function usePayloadFetcher({
  onData,
}: {
  onData: ({ payload, param }: { payload: Payload; param: string }) => void;
}) {
  const router = useRouter();

  useEffect(() => {
    const { payload } = router.query;

    const param = Array.isArray(payload) ? payload[0] : payload;
    const trimmedParam = param?.trim();

    if (!trimmedParam) return;

    if (!isValidUrl(trimmedParam)) {
      console.error("Invalid url");
      return;
    }

    fetch(new URL(trimmedParam))
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load the data");
        }

        return res.json();
      })
      .then((result) => {
        onData({
          payload: result,
          param: trimmedParam,
        });
      })
      .catch(console.error);
  }, [router.query]);
}
