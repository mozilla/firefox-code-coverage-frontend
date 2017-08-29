let raw_diff = `# HG changeset patch
# User Nathan Froyd <froydnj@mozilla.com>
# Date 1499190462 14400
#      Tue Jul 04 13:47:42 2017 -0400
# Node ID 12e33b9d6f91d008603abc7140a8957c8b9b0ad6
# Parent  6c1336c071ccf412d4e85887c8f55bae683429da
Bug 1347963 - part 7 - make ImageContainer use RecursiveMutex; r=kats

Making ImageContainer slightly faster with RecursiveMutex is a good thing.
We need to fix up some cargo-culting of includes along the way, though.

diff --git a/gfx/layers/ImageContainer.cpp b/gfx/layers/ImageContainer.cpp
--- a/gfx/layers/ImageContainer.cpp
+++ b/gfx/layers/ImageContainer.cpp
@@ -129,7 +129,7 @@ ImageContainerListener::ClearImageContai
 already_AddRefed<ImageClient>
 ImageContainer::GetImageClient()
 {
-  ReentrantMonitorAutoEnter mon(mReentrantMonitor);
+  RecursiveMutexAutoLock mon(mRecursiveMutex);
   EnsureImageClient();
   RefPtr<ImageClient> imageClient = mImageClient;
   return imageClient.forget();
@@ -163,7 +163,7 @@ ImageContainer::EnsureImageClient()
 }

 ImageContainer::ImageContainer(Mode flag)
-: mReentrantMonitor("ImageContainer.mReentrantMonitor"),
+: mRecursiveMutex("ImageContainer.mRecursiveMutex"),
   mGenerationCounter(++sGenerationCounter),
   mPaintCount(0),
   mDroppedImageCount(0),
@@ -178,7 +178,7 @@ ImageContainer::ImageContainer(Mode flag
 }

 ImageContainer::ImageContainer(const CompositableHandle& aHandle)
-  : mReentrantMonitor("ImageContainer.mReentrantMonitor"),
+  : mRecursiveMutex("ImageContainer.mRecursiveMutex"),
   mGenerationCounter(++sGenerationCounter),
   mPaintCount(0),
   mDroppedImageCount(0),
@@ -206,7 +206,7 @@ ImageContainer::~ImageContainer()
 RefPtr<PlanarYCbCrImage>
 ImageContainer::CreatePlanarYCbCrImage()
 {
-  ReentrantMonitorAutoEnter mon(mReentrantMonitor);
+  RecursiveMutexAutoLock lock(mRecursiveMutex);
   EnsureImageClient();
   if (mImageClient && mImageClient->AsImageClientSingle()) {
     return new SharedPlanarYCbCrImage(mImageClient);
@@ -217,7 +217,7 @@ ImageContainer::CreatePlanarYCbCrImage()
 RefPtr<SharedRGBImage>
 ImageContainer::CreateSharedRGBImage()
 {
-  ReentrantMonitorAutoEnter mon(mReentrantMonitor);
+  RecursiveMutexAutoLock lock(mRecursiveMutex);
   EnsureImageClient();
   if (!mImageClient || !mImageClient->AsImageClientSingle()) {
     return nullptr;
@@ -228,7 +228,7 @@ ImageContainer::CreateSharedRGBImage()
 void
 ImageContainer::SetCurrentImageInternal(const nsTArray<NonOwningImage>& aImages)
 {
-  ReentrantMonitorAutoEnter mon(mReentrantMonitor);
+  RecursiveMutexAutoLock lock(mRecursiveMutex);

   mGenerationCounter = ++sGenerationCounter;

@@ -298,7 +298,7 @@ ImageContainer::SetCurrentImageInternal(
 void
 ImageContainer::ClearImagesFromImageBridge()
 {
-  ReentrantMonitorAutoEnter mon(mReentrantMonitor);
+  RecursiveMutexAutoLock lock(mRecursiveMutex);
   SetCurrentImageInternal(nsTArray<NonOwningImage>());
 }`

 let code_cov_info = [
   {
     "name": "gfx/layers/ImageContainer.cpp",
     "changes": {
       "old": [
         {
           "coverage": true,
           "line": 132,
           "content": "ReentrantMonitorAutoEnter mon(mReentrantMonitor);"
         }
       ],
       "new": [
         {
           "coverage": true,
           "line": 132,
           "content": "  RecursiveMutexAutoLock mon(mRecursiveMutex);"
         }
       ]
     }
   }
 ]

 let code_cov_commits = {"meta": {"status": 200, "limit": 20, "page": 1}, "owner": {"plan_activated_users": null, "updatestamp": "2017-08-28 21:28:34.22252+00", "username": "marco-c", "name": "Marco", "plan_user_count": null, "integration_id": null, "service_id": "1616846", "service": "github", "plan_auto_activate": null, "free": 0}, "commits": [{"ci_passed": true, "deleted": null, "parent_totals": {"diff": [12, 129, 85, 44, 0, "65.89147", 0, 0, 0, 0, 0, 0, 0], "M": 0, "s": 1, "p": 0, "c": "63.50107", "h": 1700462, "n": 2677848, "m": 977386, "C": 0, "b": 0, "N": 0, "f": 15238, "d": 0}, "pullid": null, "timestamp": "2017-08-28 11:18:33", "totals": {"diff": [1, 1, 1, 0, 0, "100", 0, 0, 0, 0, 0, 0, 0], "m": 977607, "s": 1, "p": 0, "c": "63.49368", "h": 1700305, "N": 0, "M": 0, "C": 0, "b": 0, "d": 0, "f": 15239, "n": 2677912}, "message": "Backed out changeset 2db66a67c944 (bug 1392468) for failing clipboard's browser/base/content/test/newtab/browser_newtab_undo.js. r=backout", "merged": false, "state": "complete", "commitid": "79c12610f3983ba3a99f8dfddd3b416637812f7c", "branch": "master", "author": {"username": "Archaeopteryx", "service_id": "216576", "service": "github", "name": "Sebastian Hengst", "email": "archaeopteryx@coole-files.de"}}, {"ci_passed": true, "deleted": null, "parent_totals": {"diff": [63, 819, 700, 119, 0, "85.47009", 0, 0, 0, 0, 0, 0, 0], "m": 977821, "s": 1, "p": 0, "C": 0, "h": 1700037, "N": 0, "M": 0, "c": "63.48496", "b": 0, "f": 15229, "n": 2677858, "d": 0}, "pullid": null, "timestamp": "2017-08-28 00:31:55", "totals": {"diff": [12, 129, 85, 44, 0, "65.89147", 0, 0, 0, 0, 0, 0, 0], "M": 0, "s": 1, "p": 0, "c": "63.50107", "h": 1700462, "n": 2677848, "m": 977386, "C": 0, "b": 0, "N": 0, "f": 15238, "d": 0}, "message": "Merge m-i to m-c, a=merge\n\nMozReview-Commit-ID: AX10UmzAEqg", "merged": false, "state": "complete", "commitid": "f144cb08b979676201e85491c2a5ee41bc8af03e", "branch": "master", "author": {"username": "philor", "service_id": "427182", "service": "github", "name": "Phil Ringnalda", "email": "philringnalda@gmail.com"}}, {"ci_passed": true, "deleted": null, "parent_totals": {"diff": [191, 1585, 916, 669, 0, "57.79180", 0, 0, 0, 0, 0, 0, 0], "m": 977695, "s": 1, "p": 0, "c": "63.49351", "h": 1700445, "N": 0, "M": 0, "C": 0, "b": 0, "d": 0, "f": 15235, "n": 2678140}, "pullid": null, "timestamp": "2017-08-28 00:30:51", "totals": {"diff": [35, 128, 110, 18, 0, "85.93750", 0, 0, 0, 0, 0, 0, 0], "m": 977480, "s": 1, "p": 0, "c": "63.50081", "h": 1700607, "N": 0, "M": 0, "C": 0, "b": 0, "f": 15238, "n": 2678087, "d": 0}, "message": "Merge autoland to m-c, a=merge\n\nMozReview-Commit-ID: IS1hqTsOs9q", "merged": false, "state": "complete", "commitid": "f6a8febe291b7a482c1f182fd4023a90ab67cec0", "branch": "master", "author": {"username": "philor", "service_id": "427182", "service": "github", "name": "Phil Ringnalda", "email": "philringnalda@gmail.com"}}, {"ci_passed": true, "deleted": null, "parent_totals": {"diff": [63, 819, 700, 119, 0, "85.47009", 0, 0, 0, 0, 0, 0, 0], "m": 977821, "s": 1, "p": 0, "C": 0, "h": 1700037, "N": 0, "M": 0, "c": "63.48496", "b": 0, "f": 15229, "n": 2677858, "d": 0}, "pullid": null, "timestamp": "2017-08-25 23:21:57", "totals": {"diff": [191, 1585, 916, 669, 0, "57.79180", 0, 0, 0, 0, 0, 0, 0], "m": 977695, "s": 1, "p": 0, "c": "63.49351", "h": 1700445, "N": 0, "M": 0, "C": 0, "b": 0, "d": 0, "f": 15235, "n": 2678140}, "message": "Merge inbound to central, a=merge\n\nMozReview-Commit-ID: 3N9jinnrmjb", "merged": false, "state": "complete", "commitid": "68149d6a5931e9869b0bf587efdcc7bfaf687a9e", "branch": "master", "author": {"username": "KWierso", "service_id": "172215", "service": "github", "name": null, "email": null}}, {"ci_passed": true, "deleted": null, "parent_totals": {"diff": [48, 306, 206, 100, 0, "67.32026", 0, 0, 0, 0, 0, 0, 0], "M": 0, "s": 1, "p": 0, "C": 0, "h": 1698608, "n": 2675812, "m": 977204, "c": "63.48010", "b": 0, "N": 0, "f": 15209, "d": 0}, "pullid": null, "timestamp": "2017-08-25 21:20:56", "totals": {"diff": [63, 819, 700, 119, 0, "85.47009", 0, 0, 0, 0, 0, 0, 0], "m": 977821, "s": 1, "p": 0, "C": 0, "h": 1700037, "N": 0, "M": 0, "c": "63.48496", "b": 0, "f": 15229, "n": 2677858, "d": 0}, "message": "Merge autoland to central, a=merge\n\nMozReview-Commit-ID: KkDgwqt55WQ", "merged": false, "state": "complete", "commitid": "a9e27dfc6eb5fa757c8d2d75db4044365caeb439", "branch": "master", "author": {"username": "KWierso", "service_id": "172215", "service": "github", "name": null, "email": null}}, {"ci_passed": true, "deleted": null, "parent_totals": {"diff": [48, 306, 206, 100, 0, "67.32026", 0, 0, 0, 0, 0, 0, 0], "M": 0, "s": 1, "p": 0, "C": 0, "h": 1698608, "n": 2675812, "m": 977204, "c": "63.48010", "b": 0, "N": 0, "f": 15209, "d": 0}, "pullid": null, "timestamp": "2017-08-24 23:21:48", "totals": {"p": 0, "m": 977802, "s": 1, "diff": null, "C": 0, "h": 1700163, "n": 2677965, "M": 0, "c": "63.48713", "b": 0, "N": 0, "f": 15234, "d": 0}, "message": "Bug 1377911 - Move the override chrome entries from language manifests to product manifests. r=Pike a=merge\n\nMozReview-Commit-ID: 7VgO2ui9yH5\n\n--HG--\nextra : source : 8396a848ae256af62f3f67779d69c8434d378c23", "merged": false, "state": "complete", "commitid": "b818d7319701871bdbdbede23e12cfe7afd6ea32", "branch": "master", "author": {"username": "zbraniecki", "service_id": "449986", "service": "github", "name": null, "email": null}}, {"ci_passed": true, "deleted": null, "parent_totals": {"p": 0, "M": 0, "s": 1, "diff": [33, 255, 220, 35, 0, "86.27451", 0, 0, 0, 0, 0, 0, 0], "C": 0, "h": 1698776, "n": 2675442, "m": 976666, "c": "63.49515", "b": 0, "N": 0, "f": 15224, "d": 0}, "pullid": null, "timestamp": "2017-08-24 11:28:57", "totals": {"diff": [48, 306, 206, 100, 0, "67.32026", 0, 0, 0, 0, 0, 0, 0], "M": 0, "s": 1, "p": 0, "C": 0, "h": 1698608, "n": 2675812, "m": 977204, "c": "63.48010", "b": 0, "N": 0, "f": 15209, "d": 0}, "message": "merge mozilla-inbound to mozilla-central. r=merge a=merge\n\nMozReview-Commit-ID: 6TGQRm8SSk0", "merged": false, "state": "complete", "commitid": "aeacc3488368f802a0665058683f9ee0b8f3a235", "branch": "master", "author": {"username": "Archaeopteryx", "service_id": "216576", "service": "github", "name": "Sebastian Hengst", "email": "archaeopteryx@coole-files.de"}}, {"ci_passed": true, "deleted": null, "parent_totals": {"p": 0, "M": 0, "s": 1, "diff": [33, 255, 220, 35, 0, "86.27451", 0, 0, 0, 0, 0, 0, 0], "C": 0, "h": 1698776, "n": 2675442, "m": 976666, "c": "63.49515", "b": 0, "N": 0, "f": 15224, "d": 0}, "pullid": null, "timestamp": "2017-08-24 10:34:57", "totals": {"diff": null, "M": 0, "s": 1, "p": 0, "c": "63.48138", "h": 1699625, "N": 0, "m": 977735, "C": 0, "b": 0, "d": 0, "f": 15226, "n": 2677360}, "message": "Bug 1393385 - Update about:preferences category menu to match the spec r=jaws\n\n--HG--\nextra : rebase_source : e01fc7a0004d5d14716347837ed74b6daf26ab44", "merged": false, "state": "pending", "commitid": "3604cbdd8d9ee5b1e273d4af86cef451c2049468", "branch": "master", "author": {"username": "rickychien", "service_id": "958165", "service": "github", "name": "Ricky Chien", "email": "ricky060709@gmail.com"}}, {"ci_passed": true, "deleted": null, "parent_totals": {"p": 0, "M": 0, "s": 1, "diff": null, "C": 0, "h": 1698678, "n": 2675278, "m": 976600, "c": "63.49538", "b": 0, "N": 0, "f": 15224, "d": 0}, "pullid": null, "timestamp": "2017-08-23 23:06:56", "totals": {"p": 0, "M": 0, "s": 1, "diff": [33, 255, 220, 35, 0, "86.27451", 0, 0, 0, 0, 0, 0, 0], "C": 0, "h": 1698776, "n": 2675442, "m": 976666, "c": "63.49515", "b": 0, "N": 0, "f": 15224, "d": 0}, "message": "Merge autoland to central, a=merge\n\nMozReview-Commit-ID: BBXcBGQQdeo", "merged": false, "state": "complete", "commitid": "bc3395b5c609f71b4a99f25f1bcf1a851004d0c7", "branch": "master", "author": {"username": "KWierso", "service_id": "172215", "service": "github", "name": null, "email": null}}, {"ci_passed": true, "deleted": null, "parent_totals": {"diff": null, "M": 0, "s": 1, "p": 0, "c": "63.49936", "h": 1698493, "N": 0, "m": 976326, "C": 0, "b": 0, "d": 0, "f": 15225, "n": 2674819}, "pullid": null, "timestamp": "2017-08-23 17:20:57", "totals": {"p": 0, "M": 0, "s": 1, "diff": null, "C": 0, "h": 1698678, "n": 2675278, "m": 976600, "c": "63.49538", "b": 0, "N": 0, "f": 15224, "d": 0}, "message": "No bug, Automated HPKP preload list update from host bld-linux64-spot-303 - a=hpkp-update", "merged": false, "state": "complete", "commitid": "d0bae45c359a030ea2851058d0a28ef592348c49", "branch": "master", "author": {"username": "invalid-email-address", "service_id": "148100", "service": "github", "name": null, "email": null}}, {"ci_passed": true, "deleted": null, "parent_totals": {"diff": null, "M": 0, "s": 1, "p": 0, "c": "63.49991", "h": 1698730, "N": 0, "m": 976439, "C": 0, "b": 0, "d": 0, "f": 15224, "n": 2675169}, "pullid": null, "timestamp": "2017-08-23 14:29:51", "totals": {"diff": [67, 394, 272, 122, 0, "69.03553", 0, 0, 0, 0, 0, 0, 0], "M": 0, "s": 1, "p": 0, "c": "63.49169", "h": 1698468, "n": 2675103, "m": 976635, "C": 0, "b": 0, "N": 0, "f": 15223, "d": 0}, "message": "merge mozilla-inbound to mozilla-central. r=merge a=merge\n\nMozReview-Commit-ID: GSKVB94r7Kk", "merged": false, "state": "complete", "commitid": "99e5cb9c144eb5cedbf5ef982d4d3e3e53390868", "branch": "master", "author": {"username": "Archaeopteryx", "service_id": "216576", "service": "github", "name": "Sebastian Hengst", "email": "archaeopteryx@coole-files.de"}}, {"ci_passed": true, "deleted": null, "parent_totals": {"p": 0, "M": 0, "s": 1, "diff": [63, 885, 767, 118, 0, "86.66667", 0, 0, 0, 0, 0, 0, 0], "C": 0, "h": 1698124, "n": 2673800, "m": 975676, "c": "63.50976", "b": 0, "N": 0, "f": 15209, "d": 0}, "pullid": null, "timestamp": "2017-08-23 00:46:40", "totals": {"diff": null, "M": 0, "s": 1, "p": 0, "c": "63.49991", "h": 1698730, "N": 0, "m": 976439, "C": 0, "b": 0, "d": 0, "f": 15224, "n": 2675169}, "message": "Bug 1392724 - Improve Nightly Branding iteration 06. r=mconley, a=RyanVM", "merged": false, "state": "pending", "commitid": "ddf19ad0083dec0760f68ab5945e9147b8f07046", "branch": "master", "author": {"username": "shorlander", "service_id": "684427", "service": "github", "name": "Stephen Horlander", "email": "shorlander@mozilla.com"}}, {"ci_passed": true, "deleted": null, "parent_totals": {"diff": [42, 517, 277, 240, 0, "53.57834", 0, 0, 0, 0, 0, 0, 0], "M": 0, "s": 1, "p": 0, "C": 0, "h": 1698348, "N": 0, "m": 976474, "c": "63.49387", "b": 0, "f": 15223, "n": 2674822, "d": 0}, "pullid": null, "timestamp": "2017-08-23 00:07:23", "totals": {"p": 0, "M": 0, "s": 1, "diff": [63, 885, 767, 118, 0, "86.66667", 0, 0, 0, 0, 0, 0, 0], "C": 0, "h": 1698124, "n": 2673800, "m": 975676, "c": "63.50976", "b": 0, "N": 0, "f": 15209, "d": 0}, "message": "Merge inbound to central, a=merge\n\nMozReview-Commit-ID: BMWuqvmTljV", "merged": false, "state": "complete", "commitid": "6dd42e26642c7cc3766408b38b88b1d3f77928b6", "branch": "master", "author": {"username": "KWierso", "service_id": "172215", "service": "github", "name": null, "email": null}}, {"ci_passed": true, "deleted": null, "parent_totals": {"diff": null, "M": 0, "s": 1, "p": 0, "c": "63.49936", "h": 1698493, "N": 0, "m": 976326, "C": 0, "b": 0, "d": 0, "f": 15225, "n": 2674819}, "pullid": null, "timestamp": "2017-08-22 22:40:16", "totals": {"diff": [42, 517, 277, 240, 0, "53.57834", 0, 0, 0, 0, 0, 0, 0], "M": 0, "s": 1, "p": 0, "C": 0, "h": 1698348, "N": 0, "m": 976474, "c": "63.49387", "b": 0, "f": 15223, "n": 2674822, "d": 0}, "message": "Merge autoland to central, a=merge\n\nMozReview-Commit-ID: EGoWUCpbeu6", "merged": false, "state": "complete", "commitid": "7c8f449d41feff3e88bd0fc47b9984bb7e72a6f9", "branch": "master", "author": {"username": "KWierso", "service_id": "172215", "service": "github", "name": null, "email": null}}, {"ci_passed": true, "deleted": null, "parent_totals": {"p": 0, "m": 966367, "s": 1, "diff": null, "C": 0, "h": 1669407, "n": 2635774, "M": 0, "c": "63.33650", "b": 0, "N": 0, "f": 15290, "d": 0}, "pullid": null, "timestamp": "2017-08-22 13:09:42", "totals": {"diff": null, "M": 0, "s": 1, "p": 0, "c": "63.49936", "h": 1698493, "N": 0, "m": 976326, "C": 0, "b": 0, "d": 0, "f": 15225, "n": 2674819}, "message": "Backed out changeset 082978a77728 (bug 1385227) for breaking L10n nightlies on Windows. r=backout a=backout\n\nMozReview-Commit-ID: 2q0X3BWpJWP", "merged": false, "state": "complete", "commitid": "792dbaef791c7ec2d8cbf737ecb34160440d5b21", "branch": "master", "author": {"username": "Archaeopteryx", "service_id": "216576", "service": "github", "name": "Sebastian Hengst", "email": "archaeopteryx@coole-files.de"}}, {"ci_passed": null, "deleted": null, "parent_totals": null, "pullid": null, "timestamp": "2017-08-21 23:39:56", "totals": null, "message": "Merge inbound to m-c a=merge\n\nMozReview-Commit-ID: 7PZEeFIzle5", "merged": false, "state": "pending", "commitid": "88c4efea2a5bbdee325e79cc856140ec14c07cbd", "branch": "master", "author": {"username": "KWierso", "service_id": "172215", "service": "github", "name": null, "email": null}}, {"ci_passed": true, "deleted": null, "parent_totals": {"p": 0, "m": 966734, "s": 1, "diff": [24, 269, 254, 15, 0, "94.42379", 0, 0, 0, 0, 0, 0, 0], "C": 0, "h": 1670162, "n": 2636896, "M": 0, "c": "63.33818", "b": 0, "N": 0, "f": 15301, "d": 0}, "pullid": null, "timestamp": "2017-08-21 13:47:57.642575", "totals": {"p": 0, "m": 966367, "s": 1, "diff": null, "C": 0, "h": 1669407, "n": 2635774, "M": 0, "c": "63.33650", "b": 0, "N": 0, "f": 15290, "d": 0}, "message": null, "merged": null, "state": "complete", "commitid": "b258e6864ee3e809d40982bc5d0d5aff66a20780", "branch": "master", "author": null}, {"ci_passed": true, "deleted": null, "parent_totals": {"diff": [146, 1168, 886, 282, 0, "75.85616", 0, 0, 0, 0, 0, 0, 0], "m": 966812, "s": 1, "p": 0, "c": "63.33269", "h": 1669902, "N": 0, "M": 0, "C": 0, "b": 0, "f": 15300, "n": 2636714, "d": 0}, "pullid": null, "timestamp": "2017-08-19 22:29:10", "totals": {"p": 0, "m": 966734, "s": 1, "diff": [24, 269, 254, 15, 0, "94.42379", 0, 0, 0, 0, 0, 0, 0], "C": 0, "h": 1670162, "n": 2636896, "M": 0, "c": "63.33818", "b": 0, "N": 0, "f": 15301, "d": 0}, "message": "Merge inbound to m-c, a=merge\n\nMozReview-Commit-ID: LCCoXUsCtmv", "merged": false, "state": "complete", "commitid": "9359f5bf39a75fb44d0fa5ae3b9118dd5184dd3e", "branch": "master", "author": {"username": "philor", "service_id": "427182", "service": "github", "name": "Phil Ringnalda", "email": "philringnalda@gmail.com"}}, {"ci_passed": true, "deleted": null, "parent_totals": {"p": 0, "M": 0, "s": 1, "diff": null, "c": "63.31174", "h": 1667747, "n": 2634183, "m": 966436, "C": 0, "b": 0, "N": 0, "f": 15290, "d": 0}, "pullid": null, "timestamp": "2017-08-18 22:53:07", "totals": {"diff": [146, 1168, 886, 282, 0, "75.85616", 0, 0, 0, 0, 0, 0, 0], "m": 966812, "s": 1, "p": 0, "c": "63.33269", "h": 1669902, "N": 0, "M": 0, "C": 0, "b": 0, "f": 15300, "n": 2636714, "d": 0}, "message": "Merge inbound to central, a=merge\n\nMozReview-Commit-ID: 4cWGBbMEU2x", "merged": false, "state": "complete", "commitid": "b1fc5e008c0a061ba48fbae28ba21d1071a1ab46", "branch": "master", "author": {"username": "KWierso", "service_id": "172215", "service": "github", "name": null, "email": null}}, {"ci_passed": true, "deleted": null, "parent_totals": {"diff": [8, 189, 175, 14, 0, "92.59259", 0, 0, 0, 0, 0, 0, 0], "m": 966482, "s": 1, "p": 0, "c": "63.30739", "h": 1667514, "N": 0, "M": 0, "C": 0, "b": 0, "f": 15281, "n": 2633996, "d": 0}, "pullid": null, "timestamp": "2017-08-18 17:33:42", "totals": {"p": 0, "M": 0, "s": 1, "diff": null, "c": "63.31174", "h": 1667747, "n": 2634183, "m": 966436, "C": 0, "b": 0, "N": 0, "f": 15290, "d": 0}, "message": "No bug, Automated blocklist update from host bld-linux64-spot-309 - a=blocklist-update", "merged": false, "state": "complete", "commitid": "8d084472a955c9ef0f523c743cbad2460efd7688", "branch": "master", "author": {"username": "invalid-email-address", "service_id": "148100", "service": "github", "name": null, "email": null}}], "repo": {"image_token": "P5EIqZ52Kt", "deleted": false, "activated": false, "branch": "master", "active": true, "language": null, "name": "gecko-dev", "using_integration": null, "service_id": "84096698", "updatestamp": "2017-08-29 01:18:39.684003+00", "private": false}}

 export { raw_diff, code_cov_info, code_cov_commits };
