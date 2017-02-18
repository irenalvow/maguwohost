
# trigen-frontend-boilerplate

Boilerplate for frontend development.

# Gulp tasks

```
├── html:watch
├── html:lint
├─┬ html:dev
│ └── html:lint
├─┬ html:build
│ └── html:lint
├── images:watch
├── images:build
├── images:dev
├── style:watch
├── style:lint
├─┬ style:dev
│ └── style:lint
├─┬ style:build
│ └── style:lint
├─┬ watch
│ ├── html:watch
│ ├── images:watch
│ └── style:watch
├── server
├─┬ dev
│ └─┬── html:build
│   ├── images:build
│   ├── style:build
│   ├── server
│   └── watch
├─┬ build
│ └─┬── html:build
│   ├── images:build
│   └── style:build
└─┬ default
  └── dev
```
