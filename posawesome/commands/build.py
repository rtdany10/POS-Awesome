import os
import frappe
from frappe.build import setup, make_asset_dirs, get_node_env, check_node_executable


def vuebuild(
	mode,
	apps=None,
	hard_link=False,
	make_copy=False,
	restore=False,
	verbose=False,
	skip_frappe=False,
	files=None,
):
	"""concat / minify js files"""
	setup()
	make_asset_dirs(hard_link=hard_link)

	mode = "production" if mode == "production" else "build"
	command = f"yarn run {mode}"

	if apps:
		command += f" --apps {apps}"

	if skip_frappe:
		command += " --skip_frappe"

	if files:
		command += " --files {files}".format(files=",".join(files))

	command += " --run-build-command"

	check_node_executable()
	frappe_app_path = frappe.get_app_path("posawesome", "..")
	frappe.commands.popen(command, cwd=frappe_app_path, env=get_node_env(), raise_err=True)
