---
sidebar_position: 132
sidebar_label: 课后练习
sidebar_class_name: green
---

# 课后练习

课后练习
附件中的工程是一个"Tic-Tac-Toe"游戏。

```
X, select a space
 1  | 2  | 3
--------------
 4  | 5  | 6
--------------
 7  | 8  | 9
 ```

运行后是这样的一个棋盘。两个玩家依次落子。先排成“横”，“竖”，“斜”一条线的赢。

代码中其他文件忽略，只关注`game.rs/board.rs` 这两个文件。里面有“TODO”提示。 在提示的地方填充函数内容。

最后运行`cargo test` 提示测试通过：

```bash
running 27 tests
test board::tests::a_space_can_only_be_taken_once ... ok
test board::tests::finds_available_spaces_in_full_board ... ok
test board::tests::o_plays_next ... ok
test board::tests::finds_available_spaces_in_empty_board ... ok
test board::tests::a_space_above_the_board_cant_be_chosen ... ok
test board::tests::a_negative_space_cant_be_chosen ... ok
test board::tests::finds_available_spaces_in_an_in_progress_board ... ok
test board::tests::starts_with_no_moves ... ok
test board::tests::x_plays_first ... ok
test board::tests::takes_a_number_of_rows ... ok
test game::tests::a_tied_game_is_tied ... ok
test game::tests::a_won_game_is_not_tied ... ok
test game::tests::a_won_game_with_a_full_board_is_not_tied ... ok
test game::tests::an_empty_game_is_not_tied ... ok
test game::tests::an_empty_game_is_not_won ... ok
test game::tests::check_if_game_won_by_x_is_won ... ok
test game::tests::check_if_game_won_by_o_is_won ... ok
test game::tests::check_line_won_by_x ... ok
test game::tests::check_if_tied_game_is_won ... ok
test game::tests::check_row_not_won_by_o ... ok
test game::tests::find_winner_when_nobody_has_won ... ok
test game::tests::find_winner_when_o_has_won ... ok
test game::tests::find_winner_when_x_has_won ... ok
test game::tests::game_is_over_when_board_is_full ... ok
test game::tests::o_is_current_player_after_one_move ... ok
test game::tests::game_not_over_when_board_is_empty ... ok
test game::tests::x_is_current_player_at_start_of_game ... ok

test result: ok. 27 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

`cargo run`可以正常游戏

[练习工程](https://www.solanazh.com/assets/files/tic-tac-toe.zip)
