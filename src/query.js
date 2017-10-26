export const testCoverage = (revision, fileName) => {
  return {
    "from":"coverage",
    "where":{"and":[
      {"eq":{"source.file.name":`${fileName}`}},
      {"eq":{"repo.changeset.id12":`${revision}`}}
    ]},
    "limit":1000,
    "format":"table"
  }
}

export const testCoverageRestrictive = (revision, fileName) => {
  return {
    "limit":1000,
    "from":"coverage",
    "where":{"and":[
      {"eq":{"source.file.name":`${fileName}`}},
      {"eq":{"repo.changeset.id12":`${revision}`}}
    ]},
    "select":[
      "run.chunk",
      "run.suite.name",
      "source.file.total_covered",
      "source.file.total_uncovered"
    ],
    "format":"table"
  }
}