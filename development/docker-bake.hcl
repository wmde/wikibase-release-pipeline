# WBS DevTools image manifest. Build policy such as registry caches is supplied
# by the caller so `docker buildx bake` remains a complete local build command.

variable "WBS_DEV_IMAGE" { default = "wbs-dev:latest" }
variable "WBS_DEV_IMAGE_FINGERPRINT" { default = "" }

target "wbs-dev" {
  context    = "."
  dockerfile = "Dockerfile"
  target     = "wbs-dev"
  args = {
    WBS_DEV_IMAGE_FINGERPRINT = WBS_DEV_IMAGE_FINGERPRINT
  }
  tags   = [WBS_DEV_IMAGE]
  output = [{ type = "docker" }]
}

group "default" { targets = ["wbs-dev"] }
