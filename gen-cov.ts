#!/usr/bin/env -S deno -A

import $ from "jsr:@david/dax@0.42.0";
await $`rm -rf .cov_profile
           && deno test --ignore=tmp,exemples,.cov_profile --coverage=.cov_profile -A
           && deno coverage .cov_profile --lcov  > .cov_profile/cov_profile.lcov
           && genhtml -o .cov_profile/html .cov_profile/cov_profile.lcov`;
