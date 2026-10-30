export async function storeDailyPriceOnce(put: any, item: any) {
  try {
    await put(item, { ConditionExpression: "attribute_not_exists(PK)" });
    return true;
  } catch (error: any) {
    if (error?.name === "ConditionalCheckFailedException") return false;
    throw error;
  }
}
