module.exports = {
  distributions: `
select
  bucketed_at as date,
  sum(case when bucket = 'control' then 1 else 0 end) as control,
  sum(case when bucket != 'control' then 1 else 0 end) as variant
from entry_experiments
where experiment_name = ?
group by 1
`,

  metrics: `
select
  date(ee.bucketed_at) as date,
  sum(case when ee.bucket = 'control' then 1 else 0 end) as control,
  sum(case when ee.bucket != 'control' then 1 else 0 end) as variant
from blog_entries be
  join entry_experiments ee on be.id = ee.entry_id
  join blog_entry_tags bet on be.id = bet.entry_id
  join blog_tags bt on bt.id = bet.tag_id
where ee.experiment_name = ?
  and bt.type = 'channels'
group by 1
`,

  summary: `
select
  sums.bucket,
  sums.sum,
  counts.count,
  stddevs.stddev
from (
  select
    ee.bucket,
    count(*) as sum
  from blog_entries be
    join entry_experiments ee on be.id = ee.entry_id
    join blog_entry_tags bet on be.id = bet.entry_id
    join blog_tags bt on bt.id = bet.tag_id
  where ee.experiment_name = ?
    and bt.type = 'channels'
  group by 1
) as sums
join (
  select
    ee.bucket,
    count(*) as count
  from entry_experiments ee
  where ee.experiment_name = ?
  group by 1
) as counts
using (bucket)
join (
  select
    bucket,
    stddev(cts) as stddev
  from (
    select
      be.id,
      ee.bucket,
      count(*) as cts
    from blog_entries be
      join entry_experiments ee on be.id = ee.entry_id
      join blog_entry_tags bet on be.id = bet.entry_id
      join blog_tags bt on bt.id = bet.tag_id
    where ee.experiment_name = ?
      and bt.type = 'channels'
    group by 1
  ) entry_counts
  group by 1
) as stddevs
using (bucket)
`
};
