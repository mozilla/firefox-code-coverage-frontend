export const testCoverage = (revision, fileName) => {
  return {
    "from":"coverage",
    "where":{"and":[
      {"eq":{"source.file.name":`${fileName}`}},
      {"eq":{"repo.changeset.id12":`${revision}`}}
    ]},
    "limit":1000,
    "format":"list"
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
      "run.name",
      "run.chunk",
      "run.suite.name",
      "source.file.covered",
      "source.file.uncovered",
      "source.file.total_covered",
      "source.file.total_uncovered",
      "source.file.percentage_covered"
    ],
    "format":"list"
  }
}
