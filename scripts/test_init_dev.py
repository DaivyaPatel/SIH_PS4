import contextlib
import io
import os
from pathlib import Path
import stat
import tempfile
import unittest
from unittest.mock import patch

import init_dev


class DevelopmentConfigurationTest(unittest.TestCase):
    def test_secrets_stay_local_and_container_config_is_readable(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            output = io.StringIO()
            with patch.object(init_dev, "ROOT", root), contextlib.redirect_stdout(output):
                init_dev.initialize()
            env = root / ".env"
            store = root / ".local/dev/s3.json"
            self.assertTrue(env.is_file() and store.is_file())
            self.assertNotIn("POSTGRES_PASSWORD=", output.getvalue())
            self.assertNotIn("accessKey", output.getvalue())
            if os.name != "nt":
                self.assertEqual(stat.S_IMODE(env.stat().st_mode), 0o600)
                self.assertEqual(stat.S_IMODE(store.parent.stat().st_mode), 0o700)
                self.assertEqual(stat.S_IMODE(store.stat().st_mode), 0o644)

    def test_rerun_does_not_replace_credentials(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            with patch.object(init_dev, "ROOT", root), contextlib.redirect_stdout(io.StringIO()):
                init_dev.initialize()
                original = (root / ".env").read_bytes()
                with self.assertRaises(SystemExit):
                    init_dev.initialize()
                self.assertTrue((root / ".env").read_bytes() == original)


if __name__ == "__main__":
    unittest.main()
