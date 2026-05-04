<?php
require 'backend/api/v2/config/Database.php';
$db = new Database();
$c = $db->getConnection();
$s = $c->query("SHOW CREATE TABLE v2_usuarios");
$row = $s->fetch(PDO::FETCH_ASSOC);
echo $row['Create Table'];
