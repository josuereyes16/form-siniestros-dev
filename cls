[33mcommit fd151fe0fdbf4b120a9ea336df79607919908495[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmain[m[33m, [m[1;31morigin/main[m[33m, [m[1;31morigin/HEAD[m[33m)[m
Author: Antonio Josue Reyes <antoniojosuerp@ufps.edu.co>
Date:   Mon Sep 21 17:16:22 2026 -0500

    happy path nueva solicitud

 reports/reporte_2026-09-21_15-03-50/index.html     |  49 [32m+++[m
 .../69cd3c8c35691f5994f68eaf25368472c0dfb2b7.md    | 156 [32m+++++++++[m
 reports/reporte_2026-09-21_15-04-23/index.html     |  49 [32m+++[m
 reports/reporte_2026-09-21_15-10-06/index.html     |  49 [32m+++[m
 reports/reporte_2026-09-21_15-11-01/index.html     |  49 [32m+++[m
 .../12c0f1e66d0d44e830c85deff9e5514416759ba2.zip   | Bin [31m0[m -> [32m22378023[m bytes
 .../da54e39f28b2c5ebee07ac1bf18110b4207e6262.md    | 168 [32m+++++++++[m
 reports/reporte_2026-09-21_15-11-24/index.html     |  49 [32m+++[m
 .../trace/assets/codeMirrorModule-BbkfBe3n.js      |  32 [32m++[m
 .../trace/assets/defaultSettingsView-Ds6CBOo0.js   | 182 [32m++++++++++[m
 .../trace/assets/urlMatch-L3liM589.js              |   1 [32m+[m
 .../trace/codeMirrorModule.-QdMvsKi.css            |   1 [32m+[m
 .../trace/codicon.DCmgc-ay.ttf                     | Bin [31m0[m -> [32m80340[m bytes
 .../trace/defaultSettingsView.Bqk9acqE.css         |   1 [32m+[m
 .../trace/index.B4cLoZK3.js                        |   1 [32m+[m
 .../trace/index.B_TqY17P.css                       |   1 [32m+[m
 .../reporte_2026-09-21_15-11-24/trace/index.html   |  44 [32m+++[m
 .../trace/manifest.webmanifest                     |  16 [32m+[m
 .../trace/playwright-logo.svg                      |   9 [32m+[m
 .../trace/snapshot.B_Jk1wbt.js                     |   1 [32m+[m
 .../trace/snapshot.html                            |  10 [32m+[m
 .../reporte_2026-09-21_15-11-24/trace/sw.bundle.js |   4 [32m+[m
 .../trace/uiMode.CU5KtEkS.js                       |   5 [32m+[m
 .../trace/uiMode.CyMfwkXJ.css                      |   1 [32m+[m
 .../reporte_2026-09-21_15-11-24/trace/uiMode.html  |  18 [32m+[m
 .../trace/xtermModule.kHJ-D0s7.css                 |   1 [32m+[m
 reports/reporte_2026-09-21_15-17-28/index.html     |  49 [32m+++[m
 .../48164332768668c18e89551b08e3e6418e1e0d06.zip   | Bin [31m0[m -> [32m19635142[m bytes
 .../4acf6e24cff931b5bf317a4462438c8b3871b1e4.md    | 168 [32m+++++++++[m
 .../c8e26fd6ed8a795090b640427147971eb1385993.md    |  58 [32m+++[m
 reports/reporte_2026-09-21_15-17-44/index.html     |  49 [32m+++[m
 .../trace/assets/codeMirrorModule-BbkfBe3n.js      |  32 [32m++[m
 .../trace/assets/defaultSettingsView-Ds6CBOo0.js   | 182 [32m++++++++++[m
 .../trace/assets/urlMatch-L3liM589.js              |   1 [32m+[m
 .../trace/codeMirrorModule.-QdMvsKi.css            |   1 [32m+[m
 .../trace/codicon.DCmgc-ay.ttf                     | Bin [31m0[m -> [32m80340[m bytes
 .../trace/defaultSettingsView.Bqk9acqE.css         |   1 [32m+[m
 .../trace/index.B4cLoZK3.js                        |   1 [32m+[m
 .../trace/index.B_TqY17P.css                       |   1 [32m+[m
 .../reporte_2026-09-21_15-17-44/trace/index.html   |  44 [32m+++[m
 .../trace/manifest.webmanifest                     |  16 [32m+[m
 .../trace/playwright-logo.svg                      |   9 [32m+[m
 .../trace/snapshot.B_Jk1wbt.js                     |   1 [32m+[m
 .../trace/snapshot.html                            |  10 [32m+[m
 .../reporte_2026-09-21_15-17-44/trace/sw.bundle.js |   4 [32m+[m
 .../trace/uiMode.CU5KtEkS.js                       |   5 [32m+[m
 .../trace/uiMode.CyMfwkXJ.css                      |   1 [32m+[m
 .../reporte_2026-09-21_15-17-44/trace/uiMode.html  |  18 [32m+[m
 .../trace/xtermModule.kHJ-D0s7.css                 |   1 [32m+[m
 .../11dcba465b8f91deafad781199cf4ba289bb9c0c.md    | 229 [32m++++++++++++[m
 .../4b47b562880c9f209345f7ff93a49740ee1d324c.md    |  83 [32m+++++[m
 .../d63d29abfe1536c897f3969374f7fda90e84ad68.zip   | Bin [31m0[m -> [32m8248748[m bytes
 reports/reporte_2026-09-21_15-25-38/index.html     |  49 [32m+++[m
 .../trace/assets/codeMirrorModule-BbkfBe3n.js      |  32 [32m++[m
 .../trace/assets/defaultSettingsView-Ds6CBOo0.js   | 182 [32m++++++++++[m
 .../trace/assets/urlMatch-L3liM589.js              |   1 [32m+[m
 .../trace/codeMirrorModule.-QdMvsKi.css            |   1 [32m+[m
 .../trace/codicon.DCmgc-ay.ttf                     | Bin [31m0[m -> [32m80340[m bytes
 .../trace/defaultSettingsView.Bqk9acqE.css         |   1 [32m+[m
 .../trace/index.B4cLoZK3.js                        |   1 [32m+[m
 .../trace/index.B_TqY17P.css                       |   1 [32m+[m
 .../reporte_2026-09-21_15-25-38/trace/index.html   |  44 [32m+++[m
 .../trace/manifest.webmanifest                     |  16 [32m+[m
 .../trace/playwright-logo.svg                      |   9 [32m+[m
 .../trace/snapshot.B_Jk1wbt.js                     |   1 [32m+[m
 .../trace/snapshot.html                            |  10 [32m+[m
 .../reporte_2026-09-21_15-25-38/trace/sw.bundle.js |   4 [32m+[m
 .../trace/uiMode.CU5KtEkS.js                       |   5 [32m+[m
 .../trace/uiMode.CyMfwkXJ.css                      |   1 [32m+[m
 .../reporte_2026-09-21_15-25-38/trace/uiMode.html  |  18 [32m+[m
 .../trace/xtermModule.kHJ-D0s7.css                 |   1 [32m+[m
 reports/reporte_2026-09-21_15-30-58/index.html     |  49 [32m+++[m
 reports/reporte_2026-09-21_15-31-26/index.html     |  49 [32m+++[m
 .../0848a2ad0ebe34bfd9070645e43a1441f2803b3d.md    | 211 [32m+++++++++++[m
 .../1133abf785e3b5a8c22ac0fe0443f67d6a4a65af.zip   | Bin [31m0[m -> [32m7461537[m bytes
 .../f33ed286259d68c76a950f0998030986a8f90f2c.md    | 140 [32m++++++++[m
 reports/reporte_2026-09-21_15-32-15/index.html     |  49 [32m+++[m
 .../trace/assets/codeMirrorModule-BbkfBe3n.js      |  32 [32m++[m
 .../trace/assets/defaultSettingsView-Ds6CBOo0.js   | 182 [32m++++++++++[m
 .../trace/assets/urlMatch-L3liM589.js              |   1 [32m+[m
 .../trace/codeMirrorModule.-QdMvsKi.css            |   1 [32m+[m
 .../trace/codicon.DCmgc-ay.ttf                     | Bin [31m0[m -> [32m80340[m bytes
 .../trace/defaultSettingsView.Bqk9acqE.css         |   1 [32m+[m
 .../trace/index.B4cLoZK3.js                        |   1 [32m+[m
 .../trace/index.B_TqY17P.css                       |   1 [32m+[m
 .../reporte_2026-09-21_15-32-15/trace/index.html   |  44 [32m+++[m
 .../trace/manifest.webmanifest                     |  16 [32m+[m
 .../trace/playwright-logo.svg                      |   9 [32m+[m
 .../trace/snapshot.B_Jk1wbt.js                     |   1 [32m+[m
 .../trace/snapshot.html                            |  10 [32m+[m
 .../reporte_2026-09-21_15-32-15/trace/sw.bundle.js |   4 [32m+[m
 .../trace/uiMode.CU5KtEkS.js                       |   5 [32m+[m
 .../trace/uiMode.CyMfwkXJ.css                      |   1 [32m+[m
 .../reporte_2026-09-21_15-32-15/trace/uiMode.html  |  18 [32m+[m
 .../trace/xtermModule.kHJ-D0s7.css                 |   1 [32m+[m
 .../4c52f112b5e40515a45c6a5f91dfcc679aada0b3.zip   | Bin [31m0[m -> [32m8235820[m bytes
 .../90b574b77d73ceb270f8ce003b732172872373a1.md    |  99 [32m++++++[m
 reports/reporte_2026-09-21_15-33-59/index.html     |  49 [32m+++[m
 .../trace/assets/codeMirrorModule-BbkfBe3n.js      |  32 [32m++[m
 .../trace/assets/defaultSettingsView-Ds6CBOo0.js   | 182 [32m++++++++++[m
 .../trace/assets/urlMatch-L3liM589.js              |   1 [32m+[m
 .../trace/codeMirrorModule.-QdMvsKi.css            |   1 [32m+[m
 .../trace/codicon.DCmgc-ay.ttf                     | Bin [31m0[m -> [32m80340[m bytes
 .../trace/defaultSettingsView.Bqk9acqE.css         |   1 [32m+[m
 .../trace/index.B4cLoZK3.js                        |   1 [32m+[m
 .../trace/index.B_TqY17P.css                       |   1 [32m+[m
 .../reporte_2026-09-21_15-33-59/trace/index.html   |  44 [32m+++[m
 .../trace/manifest.webmanifest                     |  16 [32m+[m
 .../trace/playwright-logo.svg                      |   9 [32m+[m
 .../trace/snapshot.B_Jk1wbt.js                     |   1 [32m+[m
 .../trace/snapsh