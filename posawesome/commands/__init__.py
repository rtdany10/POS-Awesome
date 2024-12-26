import os
import click
import frappe
from posawesome.commands.build import vuebuild


@click.command("build")
@click.option("--app", help="Build assets for app")
@click.option("--apps", help="Build assets for specific apps")
@click.option(
	"--hard-link",
	is_flag=True,
	default=False,
	help="Copy the files instead of symlinking",
	envvar="FRAPPE_HARD_LINK_ASSETS",
)
@click.option("--production", is_flag=True, default=False, help="Build assets in production mode")
@click.option("--verbose", is_flag=True, default=False, help="Verbose")
@click.option(
	"--force", is_flag=True, default=False, help="Force build assets instead of downloading available"
)
@click.option(
	"--save-metafiles",
	is_flag=True,
	default=False,
	help="Saves esbuild metafiles for built assets. Useful for analyzing bundle size. More info: https://esbuild.github.io/api/#metafile",
)
def build(
	app=None,
	apps=None,
	hard_link=False,
	production=False,
	verbose=False,
	force=False,
	save_metafiles=False,
):
	"Compile JS and CSS source files"
	from frappe.build import bundle, download_frappe_assets
	from frappe.gettext.translate import compile_translations
	from frappe.utils.synchronization import filelock

	frappe.init("")

	if not apps and app:
		apps = app

	with filelock("bench_build", is_global=True, timeout=10):
		# dont try downloading assets if force used, app specified or running via CI
		if not (force or apps or os.environ.get("CI")):
			# skip building frappe if assets exist remotely
			skip_frappe = download_frappe_assets(verbose=verbose)
		else:
			skip_frappe = False

		# don't minify in developer_mode for faster builds
		development = frappe.local.conf.developer_mode or frappe.local.dev_server
		mode = "development" if development else "production"
		if production:
			mode = "production"

		if not apps:
			apps = ",".join(frappe.get_all_apps())

		if "posawesome" in apps:
			_apps = apps.split(",")
			_apps.remove("posawesome")
			apps = ",".join(_apps)
			vuebuild(mode, None, hard_link, production, verbose, force, save_metafiles)

		if apps:
			bundle(
				mode,
				apps=apps,
				hard_link=hard_link,
				verbose=verbose,
				skip_frappe=skip_frappe,
				save_metafiles=save_metafiles,
			)

		if apps and isinstance(apps, str):
			apps = apps.split(",")

		if not apps:
			apps = ['posawesome']

		for app in apps:
			print("Compiling translations for", app)
			compile_translations(app, force=force)

# commands = [build]