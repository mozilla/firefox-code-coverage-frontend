// ActiveDate queries

// https://activedata.allizom.org/tools/query.html#query_id=70sYgySl
export const getRevisions = {
  "sort":{"repo.push.date":"desc"},
  "from":"coverage",
  "groupby":["repo.changeset.id12","repo.push.date"],
  "limit":100
}
